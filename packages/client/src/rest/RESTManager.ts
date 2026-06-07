import { request } from "undici";
import { Client } from "../client/Client";
import { CDNTag } from "../builders/AttachmentBuilder";
import type { APIRoutes } from "stoat-api";
import { queryParams, RouteParams, RouteResponse, ValidPath } from "../utils/schema";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Represents an independent rate limit bucket queue
 */
class AsyncBucket {
  public remaining: number = 1;
  public resetAt: number = 0;
  public queue: Promise<void> = Promise.resolve();
}

/**
 * Custom Error class for Stoat API failures
 */
export class StoatAPIError extends Error {
  public statusCode: number;
  public apiType: string;
  public location: string;
  public rawData: any;
  public method?: string | undefined;
  public path?: string | undefined;

  constructor(statusCode: number, data: any, method?: string, path?: string) {
    let errorMessage = "Unknown API Error";
    let type = "Unknown";
    let location = "Unknown";

    if (typeof data === "object" && data !== null) {
      if ("type" in data || "location" in data) {
        type = String(data.type || type);
        location = String(data.location || location);
        errorMessage = `Type: ${type} (Location: ${location})`;
      } else if ("message" in data) {
        errorMessage = String(data.message);
      } else {
        try {
          errorMessage = JSON.stringify(data);
        } catch {
          errorMessage = "Unparseable Error Object";
        }
      }
    } else if (typeof data === "string" && data.trim() !== "") {
      errorMessage = data;
    }

    const routeInfo = method && path ? ` on ${method.toUpperCase()} ${path}` : "";

    super(`${errorMessage}${routeInfo}`);

    this.name = `StoatAPIError[${statusCode}]`;
    this.statusCode = statusCode;
    this.apiType = type;
    this.location = location;
    this.rawData = data;
    this.method = method;
    this.path = path;

    Object.setPrototypeOf(this, StoatAPIError.prototype);
  }
}
const ALL_QUERY_KEYS = new Set<string>();
for (const routes of Object.values(queryParams)) {
  for (const keys of Object.values(routes)) {
    for (const key of keys) {
      ALL_QUERY_KEYS.add(key);
    }
  }
}

export class RESTManager {
  private baseURL = "https://stoat.chat/api";

  private token: string | null = null;

  private buckets = new Map<string, AsyncBucket>();

  constructor(private client: Client) {
    // Sweep dead buckets every 5 minutes to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of this.buckets.entries()) {
        // If the bucket has its full limits back, drop it from memory
        if (now > bucket.resetAt && bucket.remaining > 0) {
          this.buckets.delete(key);
        }
      }
    }, 300000).unref();
  }

  public setToken(token: string) {
    this.token = token;
  }

  /**
   * Generates a local identifier for the bucket based on method and path.
   */
  private getRouteKey(method: string, endpoint: string): string {
    return `${method}:${endpoint}`;
  }

  public makeRequest<M extends APIRoutes["method"], P extends ValidPath<M>>(
    method: M,
    endpoint: P,
    params?: RouteParams<M, P>,
  ): Promise<RouteResponse<M, P>> {
    let finalEndpoint = endpoint as string;
    let finalBody: Record<string, any> | undefined = undefined;

    if (params && typeof params === "object") {
      const query = new URLSearchParams();
      finalBody = {};

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          if (ALL_QUERY_KEYS.has(key)) {
            query.append(key, String(value));
          } else {
            finalBody[key] = value;
          }
        }
      }

      const qs = query.toString();
      if (qs) finalEndpoint += `?${qs}`;

      if (Object.keys(finalBody).length === 0) finalBody = undefined;
    }
    const routeKey = this.getRouteKey(method, finalEndpoint);

    return new Promise((resolve, reject) => {
      let bucket = this.buckets.get(routeKey);
      if (!bucket) {
        bucket = new AsyncBucket();
        this.buckets.set(routeKey, bucket);
      }

      bucket.queue = bucket.queue.then(async () => {
        try {
          // Pass the split finalEndpoint and finalBody down to your request executor
          const result = await this.execute(method, finalEndpoint, finalBody, bucket!);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async execute(method: string, endpoint: string, body: any, bucket: AsyncBucket): Promise<any> {
    if (!this.token) {
      throw new Error("REST_NOT_READY: You must call client.login() before making API requests.");
    }
    const url = `${this.baseURL}${endpoint}`;

    if (bucket.remaining <= 0 && Date.now() < bucket.resetAt) {
      const waitTime = bucket.resetAt - Date.now();
      this.client.emit("debug", `Bucket [${method}:${endpoint}] exhausted. Waiting ${waitTime}ms proactively...`);
      await sleep(waitTime);
    }

    const options = {
      method: method as any,
      headers: {
        "X-Bot-Token": this.token,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };
    const response = await request(url, options);

    const remainingHeader = response.headers["x-ratelimit-remaining"];
    const resetAfterHeader = response.headers["x-ratelimit-reset-after"];

    if (remainingHeader !== undefined && resetAfterHeader !== undefined) {
      bucket.remaining = Number(remainingHeader);
      bucket.resetAt = Date.now() + Number(resetAfterHeader);
    }

    // Safely parse the body (handles cases where Cloudflare returns HTML/Text on 502s)
    const textBody = await response.body.text();
    let data;
    try {
      data = JSON.parse(textBody);
    } catch {
      data = textBody;
    }

    if (response.statusCode === 429) {
      const retryMs =
        typeof data === "object" && data?.retry_after ? data.retry_after : Number(resetAfterHeader) || 5000;

      this.client.emit("debug", `Hit 429 on [${method}:${endpoint}]. Retrying in ${retryMs}ms.`);

      bucket.remaining = 0;
      bucket.resetAt = Date.now() + retryMs;

      await sleep(retryMs);

      return this.execute(method, endpoint, body, bucket);
    }

    if (response.statusCode >= 400) {
      throw new StoatAPIError(response.statusCode, data, method, endpoint);
    }

    return data as any;
  }

  /**
   * Uploads a file to Stoat's CDN and returns the File ID
   */
  public async uploadFile(tag: CDNTag, fileBuffer: Buffer | Blob, filename?: string): Promise<string> {
    if (!this.token) throw new Error("REST_NOT_READY: No token available.");

    const url = `https://cdn.stoatusercontent.com/${tag}`;

    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer as Uint8Array<ArrayBuffer>]), filename);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Bot-Token": this.token,
      },
      body: formData,
    });

    if (!response.ok) {
      let errData;
      const errText = await response.text();
      try {
        errData = JSON.parse(errText);
      } catch {
        errData = errText;
      }
      throw new StoatAPIError(response.status, errData, "POST", "/attachments");
    }

    const data = (await response.json()) as { id: string };

    return data.id;
  }

  public get<P extends ValidPath<"get">>(
    endpoint: P,
    params?: RouteParams<"get", P>,
  ): Promise<RouteResponse<"get", P>> {
    return this.makeRequest("get", endpoint, params);
  }

  public post<P extends ValidPath<"post">>(
    endpoint: P,
    params?: RouteParams<"post", P>,
  ): Promise<RouteResponse<"post", P>> {
    return this.makeRequest("post", endpoint, params);
  }

  public patch<P extends ValidPath<"patch">>(
    endpoint: P,
    params?: RouteParams<"patch", P>,
  ): Promise<RouteResponse<"patch", P>> {
    return this.makeRequest("patch", endpoint, params);
  }

  public delete<P extends ValidPath<"delete">>(
    endpoint: P,
    params?: RouteParams<"delete", P>,
  ): Promise<RouteResponse<"delete", P>> {
    return this.makeRequest("delete", endpoint, params);
  }

  public put<P extends ValidPath<"put">>(
    endpoint: P,
    params?: RouteParams<"put", P>,
  ): Promise<RouteResponse<"put", P>> {
    return this.makeRequest("put", endpoint, params);
  }
}
