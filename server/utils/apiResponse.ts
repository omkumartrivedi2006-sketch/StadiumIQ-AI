import { Response } from "express";

export interface ApiResponseData {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
  timestamp: string;
}

export const apiResponse = {
  success(res: Response, message: string, data: any = {}, statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  error(res: Response, message: string, errors: any[] = [], statusCode = 500): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  },
};
