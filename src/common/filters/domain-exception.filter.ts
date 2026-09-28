import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { InvalidEmailException } from '../../modules/auth/domain/exceptions/invalid-email.exception';
import { InvalidOtpException } from '../../modules/auth/domain/exceptions/invalid-otp.exception';
import { InvalidRefreshTokenException } from '../../modules/auth/domain/exceptions/invalid-refresh-token.exception';
import { OtpAttemptsExhaustedException } from '../../modules/auth/domain/exceptions/otp-attempts-exhausted.exception';
import { OtpExpiredException } from '../../modules/auth/domain/exceptions/otp-expired.exception';
import { ResendCooldownException } from '../../modules/auth/domain/exceptions/resend-cooldown.exception';
import { DomainException } from '../exceptions/domain.exception';

interface ErrorEnvelope {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
}

interface MappedError {
  status: number;
  error: string;
  message: string;
}

const SERVER_ERROR: MappedError = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  error: 'Internal Server Error',
  message: 'Ocurrió un problema en el servidor. Intentá más tarde.',
};

const INVALID_EMAIL: MappedError = {
  status: HttpStatus.BAD_REQUEST,
  error: 'Bad Request',
  message: 'Ingresá un correo electrónico válido.',
};

/**
 * Global filter that maps domain exceptions (and framework HttpExceptions) to
 * the standard error envelope with the exact Spanish (voseo) user-facing message.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = this.resolve(exception);

    if (mapped.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(this.describe(exception));
    }

    const body: ErrorEnvelope = {
      success: false,
      statusCode: mapped.status,
      error: mapped.error,
      message: mapped.message,
      timestamp: new Date().toISOString(),
    };

    response.status(mapped.status).json(body);
  }

  private resolve(exception: unknown): MappedError {
    if (exception instanceof InvalidEmailException) {
      return INVALID_EMAIL;
    }
    if (exception instanceof InvalidOtpException) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'El código ingresado no es correcto.',
      };
    }
    if (exception instanceof OtpExpiredException) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'El código expiró. Solicitá uno nuevo.',
      };
    }
    if (exception instanceof OtpAttemptsExhaustedException) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Agotaste los intentos. Solicitá un nuevo código.',
      };
    }
    if (exception instanceof ResendCooldownException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: 'Esperá unos segundos antes de solicitar otro código.',
      };
    }
    if (exception instanceof InvalidRefreshTokenException) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Tu sesión expiró, iniciá sesión de nuevo.',
      };
    }

    // Generic domain exceptions (e.g. reservations) carry their own HTTP
    // status and Spanish message, so no per-case branch is needed here.
    if (
      exception instanceof DomainException &&
      typeof exception.status === 'number' &&
      typeof exception.userMessage === 'string'
    ) {
      return {
        status: exception.status,
        error: this.errorLabel(exception.status),
        message: exception.userMessage,
      };
    }

    // The global JwtAuthGuard throws UnauthorizedException with its own message.
    if (exception instanceof UnauthorizedException) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: exception.message,
      };
    }

    // ValidationPipe failures (invalid email / malformed body) arrive as BadRequestException.
    if (exception instanceof BadRequestException) {
      return INVALID_EMAIL;
    }
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }
    return SERVER_ERROR;
  }

  private resolveHttpException(exception: HttpException): MappedError {
    const status = exception.getStatus();
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return INVALID_EMAIL;
      case HttpStatus.UNAUTHORIZED:
        return {
          status,
          error: 'Unauthorized',
          message: 'El código ingresado no es correcto.',
        };
      case HttpStatus.TOO_MANY_REQUESTS:
        return {
          status,
          error: 'Too Many Requests',
          message: 'Esperá unos segundos antes de solicitar otro código.',
        };
      default:
        return { ...SERVER_ERROR, status };
    }
  }

  private errorLabel(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      default:
        return 'Error';
    }
  }

  private describe(exception: unknown): string {
    if (exception instanceof Error) {
      return `${exception.name}: ${exception.message}`;
    }
    return 'Unknown non-error exception thrown';
  }
}
