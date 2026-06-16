import { AppError } from '../../model/error/app-error';

declare const VaultFileTypeBrand: unique symbol;
export type VaultFile = string & { [VaultFileTypeBrand]: true };

export class NotValidVaultFile extends AppError {
  constructor(value: string, cause: string) {
    super(`'${value}' is not valid vault file, ${cause}`);
  }
}

export function assertValidVaultFile(value: string): asserts value is VaultFile {
  if (value.lastIndexOf('.') < 0) throw new NotValidVaultFile(value, 'no extension');

  const name = value.slice(0, value.lastIndexOf('.'));
  const extension = value.slice(value.lastIndexOf('.') + 1);

  if (name.indexOf('/') >= 0) throw new NotValidVaultFile(value, 'should not contain path');
  if (name.indexOf('\\') >= 0) throw new NotValidVaultFile(value, 'should not contain path');
  if (name.length === 0) throw new NotValidVaultFile(value, 'name is empty');
  if (extension !== 'zip') throw new NotValidVaultFile(value, 'not a zip file');
}

export function isVaultFile(value: string): value is VaultFile {
  try {
    assertValidVaultFile(value);
    return true;
  } catch {}
  return false;
}
