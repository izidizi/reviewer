export type DriveApiErrorResponse = {
  error: {
    code: number;
    message: string;
    status?: DriveApiErrorStatuses;
    errors: Array<{
      domain: string;
      location: string;
      locationType: string;
      message: string;
      reason: string;
    }>;
  };
};

export type DriveApiErrorStatuses = typeof DriveApiErrorStatus_Unauthenticated;
export const DriveApiErrorStatus_Unauthenticated = 'UNAUTHENTICATED';
