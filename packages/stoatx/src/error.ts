/**
 * Base error class for all Stoatx errors
 */
export class StoatxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoatxError";
  }
}

/**
 * Base class for all command validation errors.
 * Thrown before the command body runs when user input fails validation.
 */
export class CommandValidationError extends StoatxError {
  constructor(
    public readonly paramName: string,
    public readonly paramKind: "arg" | "option",
    message: string,
  ) {
    super(message);
    this.name = "CommandValidationError";
  }
}

/**
 * Thrown when a required positional argument is missing
 */
export class MissingArgumentError extends CommandValidationError {
  constructor(paramName: string) {
    super(paramName, "arg", `Missing required argument: \`<${paramName}>\``);
    this.name = "MissingArgumentError";
  }
}

/**
 * Thrown when a required named option is missing
 */
export class MissingOptionError extends CommandValidationError {
  constructor(paramName: string, flagPrefix: string) {
    super(paramName, "option", `Missing required option: \`${flagPrefix.repeat(2)}${paramName}\``);
    this.name = "MissingOptionError";
  }
}

/**
 * Thrown when a value cannot be cast to the expected type
 */
export class InvalidTypeError extends CommandValidationError {
  constructor(
    paramName: string,
    paramKind: "arg" | "option",
    public readonly expected: string,
    public readonly received: string,
  ) {
    super(paramName, paramKind, `Invalid value for \`${paramName}\`. Expected ${expected}, got \`${received}\`.`);
    this.name = "InvalidTypeError";
  }
}

/**
 * Thrown when a mention string cannot be parsed as a valid ULID
 */
export class InvalidMentionError extends CommandValidationError {
  constructor(
    paramName: string,
    paramKind: "arg" | "option",
    public readonly mentionKind: "user" | "channel" | "role",
    public readonly rawValue: string,
  ) {
    super(paramName, paramKind, `Invalid ${mentionKind} mention for \`${paramName}\`.`);
    this.name = "InvalidMentionError";
  }
}

/**
 * Thrown when fetch: true is set but the API call fails
 */
export class FetchFailedError extends CommandValidationError {
  constructor(
    paramName: string,
    paramKind: "arg" | "option",
    public readonly mentionKind: "user" | "channel" | "role",
    public readonly resolvedId: string,
  ) {
    super(paramName, paramKind, `Could not fetch ${mentionKind} \`${resolvedId}\` for \`${paramName}\`.`);
    this.name = "FetchFailedError";
  }
}

/**
 * Thrown when a role fetch is attempted outside a server context
 */
export class NoServerContextError extends CommandValidationError {
  constructor(paramName: string, paramKind: "arg" | "option") {
    super(paramName, paramKind, `Cannot fetch role for \`${paramName}\` outside of a server.`);
    this.name = "NoServerContextError";
  }
}
