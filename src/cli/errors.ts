export class CliUsageError extends Error {
  readonly name = "CliUsageError";

  constructor(message: string) {
    super(message);
  }
}

export class CliOperationError extends Error {
  readonly name = "CliOperationError";

  constructor(message: string, readonly cause: unknown = undefined) {
    super(message);
  }
}
