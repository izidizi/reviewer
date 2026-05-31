export class DriveApiError extends Error {}

export class DriveApiAuthenticationError extends DriveApiError {}
export class DriveApiFileNotFoundError extends DriveApiError {}
export class DriveApiUnexpectedAnswerError extends DriveApiError {}
