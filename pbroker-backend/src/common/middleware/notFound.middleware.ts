
import type { Request, Response} from 'express';
import { NotFoundError } from '../error/index.error.js';
import { APIResponder } from '../util/apiResponder.util.js';

export const notFoundHandler = (
  req: Request,
  res: Response,
) => {
  const error = new NotFoundError(`Can not find ${req.originalUrl} on this server!`);
  APIResponder.error(res, error);
};