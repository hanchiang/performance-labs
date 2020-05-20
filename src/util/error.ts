import { ThrowError } from '../types/error';

export const throwError = (errObj: ThrowError) => {
  const error: any = new Error(errObj.message);
  error.status = errObj.status;
  throw error;
};
