export const HttpStatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export abstract class CustomError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errors: string[];
  abstract readonly isLogging: boolean;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class HttpException extends CustomError {
  readonly _statusCode: number;
  readonly _isLogging: boolean;
  constructor(
    statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message = "Something went wrong",
    isLogging = false
  ) {
    super(message);
    this._statusCode = statusCode;
    this._isLogging = isLogging;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
  get errors() {
    return [this.message];
  }
  get statusCode() {
    return this._statusCode;
  }
  get isLogging() {
    return this._isLogging;
  }
}

export class HttpValidationExceptions extends CustomError {
  readonly _statusCode = HttpStatusCodes.BAD_REQUEST;
  readonly _isLogging: boolean;
  readonly _errors: string[];
  constructor(errors = ["Bad Request"], isLogging = false) {
    super("Bad Request");
    this._errors = errors;
    this._isLogging = isLogging;
    Object.setPrototypeOf(this, HttpValidationExceptions.prototype);
  }
  get errors() {
    return this._errors;
  }
  get statusCode() {
    return this._statusCode;
  }
  get isLogging() {
    return this._isLogging;
  }
}
