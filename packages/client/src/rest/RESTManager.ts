import { Client } from "../client/Client";
import type { AttachmentData, CDNTag } from "../builders/AttachmentBuilder";
import type { APIRoutes } from "stoat-api";
import { queryParams, RouteParams, RouteResponse, ValidPath } from "../utils/schema";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Abort a request that has not completed within this many milliseconds. */
const REQUEST_TIMEOUT_MS = 15_000;
/** File uploads get a longer budget than regular API calls. */
const UPLOAD_TIMEOUT_MS = 120_000;
/** Give up on a route after this many consecutive 429 responses. */
const MAX_RATELIMIT_RETRIES = 5;

/**
 * Routes that work without a token: logging in, previewing an invite, and the account routes
 * used before logging in (sign-up, email verification, password reset, confirming deletion).
 */
const UNAUTHENTICATED_ROUTES: { method: string; path: RegExp }[] = [
  { method: "post", path: /^\/auth\/session\/login$/ },
  { method: "get", path: /^\/invites\/[^/]+$/ },
  { method: "post", path: /^\/auth\/account\/create$/ },
  { method: "post", path: /^\/auth\/account\/reverify$/ },
  { method: "post", path: /^\/auth\/account\/verify\/[^/]+$/ },
  { method: "post", path: /^\/auth\/account\/reset_password$/ },
  { method: "patch", path: /^\/auth\/account\/reset_password$/ },
  { method: "put", path: /^\/auth\/account\/delete$/ },
];

/**
 * Whether a request may be sent without a token.
 * @param method The HTTP method, in any case.
 * @param endpoint The path, with or without a query string.
 */
function isUnauthenticated(method: string, endpoint: string): boolean {
  const path = endpoint.split("?")[0]!;
  return UNAUTHENTICATED_ROUTES.some((route) => route.method === method.toLowerCase() && route.path.test(path));
}

/**
 * What kind of token the client authenticates with.
 * - `"bot"`: a bot token, sent as `X-Bot-Token`.
 * - `"user"`: a user session token, sent as `X-Session-Token`.
 */
export type TokenType = "bot" | "user";

/** Extra options for a single request. */
export interface RequestOptions {
  /** Headers sent with this request only, e.g. `X-MFA-Ticket`. */
  headers?: Record<string, string>;
}

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
  private baseURL: string = "";

  private cdnURL: string = "";

  private token: string | null = null;

  private _tokenType: TokenType = "bot";

  private buckets = new Map<string, AsyncBucket>();

  private bucketSweeper: ReturnType<typeof setInterval>;

  constructor(private client: Client) {
    // Sweep dead buckets every 5 minutes to prevent memory leaks
    this.bucketSweeper = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of this.buckets.entries()) {
        // If the bucket has its full limits back, drop it from memory
        if (now > bucket.resetAt && bucket.remaining > 0) {
          this.buckets.delete(key);
        }
      }
    }, 300000);
    // Don't keep a Node process alive just for this sweeper (browsers return a number here).
    (this.bucketSweeper as { unref?: () => void }).unref?.();
  }

  /**
   * Stops the internal bucket sweeper.
   */
  public destroy(): void {
    clearInterval(this.bucketSweeper);
    this.buckets.clear();
  }

  /**
   * Sets the token sent with every request.
   * @param token The bot token or user session token.
   * @param type Whether `token` is a bot token or a user session token. Defaults to `"bot"`.
   */
  public setToken(token: string, type: TokenType = "bot") {
    this.token = token;
    this._tokenType = type;
  }

  /** Forgets the current token, e.g. after logging out. Requests that need a token will fail until a new one is set. */
  public clearToken() {
    this.token = null;
    this._tokenType = "bot";
  }

  /** Whether the current token is a bot token or a user session token. */
  public get tokenType(): TokenType {
    return this._tokenType;
  }

  /** The authentication header for the current token, or nothing if there is no token. */
  private authHeaders(): Record<string, string> {
    if (!this.token) return {};
    return { [this._tokenType === "user" ? "X-Session-Token" : "X-Bot-Token"]: this.token };
  }

  public setBaseURL(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, "");
  }

  public setCDNURL(cdnURL: string) {
    this.cdnURL = cdnURL.replace(/\/+$/, "");
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
    options: RequestOptions = {},
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
          const result = await this.execute(method, finalEndpoint, finalBody, bucket!, options.headers);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async execute(
    method: string,
    endpoint: string,
    body: any,
    bucket: AsyncBucket,
    extraHeaders: Record<string, string> = {},
    attempt: number = 0,
  ): Promise<any> {
    if (!this.token && !isUnauthenticated(method, endpoint)) {
      throw new Error("REST_NOT_READY: You must call client.login() before making API requests.");
    }
    const url = `${this.baseURL}${endpoint}`;

    if (bucket.remaining <= 0 && Date.now() < bucket.resetAt) {
      const waitTime = bucket.resetAt - Date.now();
      this.client.emit("debug", `Bucket [${method}:${endpoint}] exhausted. Waiting ${waitTime}ms proactively...`);
      await sleep(waitTime);
    }
    const isBodyMethod = ["post", "patch", "put"].includes(method.toLowerCase());
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: {
        ...this.authHeaders(),
        ...extraHeaders,
        "Content-Type": "application/json",
      },
      ...(isBodyMethod ? { body: JSON.stringify(body ?? {}) } : {}),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const remainingHeader = response.headers.get("x-ratelimit-remaining");
    const resetAfterHeader = response.headers.get("x-ratelimit-reset-after");

    if (remainingHeader !== null && resetAfterHeader !== null) {
      bucket.remaining = Number(remainingHeader);
      bucket.resetAt = Date.now() + Number(resetAfterHeader);
    }

    // Safely parse the body (handles cases where Cloudflare returns HTML/Text on 502s)
    const textBody = await response.text();
    let data;
    try {
      data = JSON.parse(textBody);
    } catch {
      data = textBody;
    }

    if (response.status === 429) {
      if (attempt >= MAX_RATELIMIT_RETRIES) {
        throw new StoatAPIError(response.status, data, method, endpoint);
      }

      const retryMs =
        typeof data === "object" && data?.retry_after ? data.retry_after : Number(resetAfterHeader) || 5000;

      this.client.emit("debug", `Hit 429 on [${method}:${endpoint}]. Retrying in ${retryMs}ms.`);

      bucket.remaining = 0;
      bucket.resetAt = Date.now() + retryMs;

      await sleep(retryMs);

      return this.execute(method, endpoint, body, bucket, extraHeaders, attempt + 1);
    }

    if (response.status >= 400) {
      throw new StoatAPIError(response.status, data, method, endpoint);
    }

    return data as any;
  }

  /**
   * Uploads a file to Stoat's CDN and returns the File ID
   * @param tag The CDN bucket to upload to, e.g. `"attachments"` or `"avatars"`.
   * @param file The file contents. A Node.js `Buffer` or a browser `File` both work.
   * @param filename The name the CDN stores the file under.
   * @returns The ID of the uploaded file.
   */
  public async uploadFile(tag: CDNTag, file: AttachmentData, filename?: string): Promise<string> {
    if (!this.token) throw new Error("REST_NOT_READY: No token available.");

    const url = `${this.cdnURL}/${tag}`;

    const formData = new FormData();
    formData.append(
      "file",
      file instanceof Blob ? file : new Blob([file] as NonNullable<ConstructorParameters<typeof Blob>[0]>),
      filename,
    );

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeaders(),
      body: formData,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
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
    options?: RequestOptions,
  ): Promise<RouteResponse<"get", P>> {
    return this.makeRequest("get", endpoint, params, options);
  }

  public post<P extends ValidPath<"post">>(
    endpoint: P,
    params?: RouteParams<"post", P>,
    options?: RequestOptions,
  ): Promise<RouteResponse<"post", P>> {
    return this.makeRequest("post", endpoint, params, options);
  }

  public patch<P extends ValidPath<"patch">>(
    endpoint: P,
    params?: RouteParams<"patch", P>,
    options?: RequestOptions,
  ): Promise<RouteResponse<"patch", P>> {
    return this.makeRequest("patch", endpoint, params, options);
  }

  public delete<P extends ValidPath<"delete">>(
    endpoint: P,
    params?: RouteParams<"delete", P>,
    options?: RequestOptions,
  ): Promise<RouteResponse<"delete", P>> {
    return this.makeRequest("delete", endpoint, params, options);
  }

  public put<P extends ValidPath<"put">>(
    endpoint: P,
    params?: RouteParams<"put", P>,
    options?: RequestOptions,
  ): Promise<RouteResponse<"put", P>> {
    return this.makeRequest("put", endpoint, params, options);
  }
}
