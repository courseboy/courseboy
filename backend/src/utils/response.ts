import { Response } from "express";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: ApiResponse<T>["meta"]
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully"
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const paginate = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const paginationMeta = (
  total: number,
  page: number,
  limit: number
): ApiResponse<unknown>["meta"] => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
