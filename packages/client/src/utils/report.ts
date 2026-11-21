import type { Client } from "../client/Client";
import type {
  ContentReportReason as RawContentReportReason,
  ReportedContent,
  UserReportReason as RawUserReportReason,
} from "stoat-api";

/** Why a message or server is being reported. */
export type ContentReportReason = RawContentReportReason;

/** Why a user is being reported. */
export type UserReportReason = RawUserReportReason;

/** Options for reporting content to Stoat's moderation team. */
export interface ReportOptions {
  /** More details for the moderators, up to 1000 characters. */
  context?: string;
}

/**
 * Sends a report to Stoat's moderation team.
 * @param client The client to send it with.
 * @param content What's being reported.
 * @param options Extra details.
 * @internal
 */
export async function sendReport(client: Client, content: ReportedContent, options: ReportOptions = {}): Promise<void> {
  await client.rest.post("/safety/report", { content, additional_context: options.context ?? "" });
}
