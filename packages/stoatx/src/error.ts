export class CommandValidationError extends Error {
  constructor(
    public readonly optionName: string,
    message: string,
  ) {
    super(message);
    this.name = "CommandValidationError";
  }
}
