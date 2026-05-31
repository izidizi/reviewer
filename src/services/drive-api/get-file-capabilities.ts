import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';
import { driveApiResponseParserFactory } from './drive-api-response-parser.method';

export type DriveFileCapabilities = {
  canAcceptOwnership: boolean;
  canAddChildren: boolean;
  canAddMyDriveParent: boolean;
  canChangeCopyRequiresWriterPermission: boolean;
  canChangeItemDownloadRestriction: boolean;
  canChangeSecurityUpdateEnabled: boolean;
  canChangeViewersCanCopyContent: boolean;
  canComment: boolean;
  canCopy: boolean;
  canDelete: boolean;
  canDisableInheritedPermissions: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canEnableInheritedPermissions: boolean;
  canListChildren: boolean;
  canModifyContent: boolean;
  canModifyContentRestriction: boolean;
  canModifyEditorContentRestriction: boolean;
  canModifyLabels: boolean;
  canModifyOwnerContentRestriction: boolean;
  canMoveChildrenWithinDrive: boolean;
  canMoveItemIntoTeamDrive: boolean;
  canMoveItemOutOfDrive: boolean;
  canMoveItemWithinDrive: boolean;
  canReadLabels: boolean;
  canReadRevisions: boolean;
  canRemoveChildren: boolean;
  canRemoveContentRestriction: boolean;
  canRemoveMyDriveParent: boolean;
  canRename: boolean;
  canShare: boolean;
  canStartApproval: boolean;
  canTrash: boolean;
  canUntrash: boolean;
};

export function getFileCapabilitiesFactory(
  driveApiErrorResponseParser: ReturnType<typeof driveApiErrorResponseParserFactory>,
  driveApiResponseParser: ReturnType<typeof driveApiResponseParserFactory>,
): (accessToken: string, id: string) => Promise<DriveFileCapabilities> {
  return async (accessToken, id) => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?fields=capabilities`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const error = await driveApiErrorResponseParser(response);
    if (error) throw error;

    const { capabilities }: { capabilities: DriveFileCapabilities } = JSON.parse(
      await driveApiResponseParser(response),
    );
    return capabilities;
  };
}
