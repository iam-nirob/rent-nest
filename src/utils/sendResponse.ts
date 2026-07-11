import { Response } from "express";
type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const { success, statusCode, message, data: responseData, meta } = data;
  res
    .status(statusCode)
    .json({ success, statusCode, message, data: responseData, meta });
};
