import { ThrowError } from '../type/error';

export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const throwError = (errObj: ThrowError) => {
  const error: any = new Error(errObj.message);
  error.status = errObj.status;
  throw error;
};
