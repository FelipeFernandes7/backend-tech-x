import { Catch, HttpException, HttpStatus } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<any>();
    const request = context.getRequest<any>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status >= 500) console.error("Unhandled server error", exception);
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : Array.isArray((exceptionResponse as any)?.message)
          ? (exceptionResponse as any).message
          : ((exceptionResponse as any)?.message ?? "Internal server error");

    response
      .status(status)
      .json({
        statusCode: status,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
  }
}
