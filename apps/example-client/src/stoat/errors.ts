import { StoatAPIError } from "@stoatx/client";

/** Turns an error from the client into a message to show the user. */
export function describeError(error: unknown): string {
  if (error instanceof StoatAPIError) {
    // `apiType` is Stoat's error code. Only the ones this app can run into are mapped here.
    switch (error.apiType) {
      case "InvalidCredentials":
        return "Wrong email or password.";
      case "UnverifiedAccount":
        return "Verify your email address first. Check your inbox for the link.";
      case "InvalidToken":
        return "That code didn't work. Check it and try again.";
      case "UsernameTaken":
        return "That username is taken.";
      case "InvalidUsername":
        return "Usernames are 2–32 characters: letters, numbers, _, . and -.";
      case "InvalidSession":
        return "Your session has ended. Log in again.";
      case "MissingPermission":
        return "You don't have permission to do that here.";
    }
    if (error.statusCode === 413) return "That's too large to upload.";
    if (error.statusCode === 429) return "Too many attempts. Wait a moment and try again.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Whether the error means the saved session no longer works, so it should be forgotten. */
export function isSessionInvalid(error: unknown): boolean {
  return error instanceof StoatAPIError && (error.statusCode === 401 || error.apiType === "InvalidSession");
}
