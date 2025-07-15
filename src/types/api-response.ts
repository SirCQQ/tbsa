export type SuccessServiceResult<T> = {
  success: true;
  data: T;
};

// export type SuccessServicePaginatedResponse<T> = {
//   success: true;
//   message?: string;
//   data: T[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

export type ErrorServiceResult<T = any> = {
  success: false;
  error: string;
  statusCode?: number;
  data?: T;
};

export type ServiceResult<T> =
  | SuccessServiceResult<T>
  // | SuccessServicePaginatedResponse<T>
  | ErrorServiceResult<T>;

export type SuccessApiPaginatedResponse<T> = {
  success: true;
  message?: string;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SuccessApiResponse<T> = {
  success: true;
  data: T;
};

export type ErrorApiResponseDetails = {
  field: string;
  message: string;
};

export type ErrorApiResponse = {
  success: false;
  error: string;
  details?: Array<ErrorApiResponseDetails>;
};

export type ApiResponse<T> =
  | SuccessApiResponse<T>
  | SuccessApiPaginatedResponse<T>
  | ErrorApiResponse;
