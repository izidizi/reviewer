declare const DriveIdTypeBrand: unique symbol;
export type DriveId = string & { [DriveIdTypeBrand]: true };

export function getDriveId(id: string): DriveId {
  return id as DriveId;
}
