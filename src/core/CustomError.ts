import { ApiError, ErrorType } from "./APIError.js";

export class BadRequestError extends ApiError {
    constructor(message: string = "Bad Requset") {
        super(ErrorType.BAD_REQUEST, 400, message)
    }
}
export class NotFoundError extends ApiError {
    constructor(message: string = "Not Found") {
        super(ErrorType.NOT_FOUND, 404, message)
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = "UnAuthorized") {
        super(ErrorType.UNAUTHORIZED, 401, message)
    }
}
export class ForbiddenError extends ApiError {
    constructor(message: string = "Forbidden") {
        super(ErrorType.FORBIDDEN, 403, message)
    }
}
export class InternalError extends ApiError {
    constructor(message: string = "Internal server Error") {
        super(ErrorType.INTERNAL, 500, message)
    }
}
export class TokenExpiredError extends ApiError {
    constructor(message: string = "Token Expired") {
        super(ErrorType.TOKEN_EXPIRED, 401, message)
    }
}

