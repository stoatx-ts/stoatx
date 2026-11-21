import type { DiscoverRequest as RawDiscoverRequest } from "stoat-api";

/**
 * Where a Discover listing request is. Discover only does something on instances that run it
 * (such as stoat.chat); elsewhere requests are stored but nobody reviews them.
 */
export interface DiscoverRequest {
  /** Whether it's for a bot or a server. */
  type: "Bot" | "Server";
  /** The bot's or server's ID. */
  id: string;
  /** Waiting in the queue, being reviewed, or decided. */
  status: "Pending" | "UnderReview" | "Approved" | "Denied" | "Removed";
  /** Why it was approved, denied or removed, if the reviewers gave a reason. */
  reason: string | null;
}

/**
 * Maps the API's Discover request, whose decided statuses are `{ Denied: reason }`-style objects.
 * @param data The raw request.
 * @internal
 */
export function toDiscoverRequest(data: RawDiscoverRequest): DiscoverRequest {
  if (typeof data.status === "string") return { type: data.type, id: data.id, status: data.status, reason: null };
  const [status, reason] = Object.entries(data.status)[0] as [DiscoverRequest["status"], string | null | undefined];
  return { type: data.type, id: data.id, status, reason: reason ?? null };
}
