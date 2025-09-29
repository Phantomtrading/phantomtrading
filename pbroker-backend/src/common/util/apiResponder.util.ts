
import type { Response } from 'express';
import type { AppError } from '../error/index.error.js';

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type APIResponse<T = any> = {
  status: 'success' | 'error';
  code: string;
  message: string;
  data?: T;
  meta?: {
    [key: string]: any;
    pagination?: PaginationMeta;
  };
  error?: {
    details?: any;
    stack?: string;
  };
};

export class APIResponder {
  static send<T>(
    res: Response,
    response: APIResponse<T>,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json(response);
  }
  static success<T>(
    res: Response,
    {
      code,
      message,
      data,
      meta,
      statusCode = 200,
    }: {
      code: string;
      message: string;
      data?: T;
      meta?: Record<string, any>;
      statusCode?: number;
    }
  ): Response {
    return this.send<T>(res, {
      status: 'success',
      code,
      message,
      ...(data !== undefined && { data }),
      ...(meta && { meta }),
    }, statusCode);
  }
  static ok<T>(res: Response, data: T, code = 'SUCCESS', message = 'Request successful'): Response {
    return this.success(res, { code, message, data, statusCode: 200 });
  }
  static created<T>(res: Response, data: T, code = 'CREATED', message = 'Resource created successfully'): Response {
    return this.success(res, { code, message, data, statusCode: 201 });
  }
  static updated<T>(res: Response, data: T, code = 'UPDATED', message = 'Request updated successfully'): Response {
    return this.success(res, { code, message, data, statusCode: 200 });
  }
  static deleted(res: Response) {
    res.status(204).end();
  }
  static paginated<T>(
    res: Response,
    {
      data,
      total,
      page,
      limit,
      code = 'PAGINATED_RESULT',
      message = 'Paginated data fetched successfully',
      meta = {},
    }: {
      data: T[];
      total: number;
      page: number;
      limit: number;
      code?: string;
      message?: string;
      meta?: Record<string, any>;
    }
  ): Response {
    const pagination: PaginationMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return this.success(res, {
      code,
      message,
      data,
      meta: { ...meta, pagination },
      statusCode: 200,
    });
  }
  static error(res: Response, error: AppError): Response {
    return this.send(res, {
      status: 'error',
      code: error.code,
      message: error.message,
      error: {
        details: error.details,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      },
    }, error.statusCode);
  }
}

