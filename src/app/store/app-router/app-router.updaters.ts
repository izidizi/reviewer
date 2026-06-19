import { PartialStateUpdater } from '@ngrx/signals';
import { AppRouterSlice } from './app-router.slice';

export type PatchVaultData = Pick<AppRouterSlice, 'vault'>;
export const patchVault: (data: PatchVaultData) => PartialStateUpdater<AppRouterSlice> = ({
  vault,
}) => {
  return () => ({
    vault,
  });
};

export type PatchLastUrlData = Pick<AppRouterSlice, 'lastUrl'>;
export const patchLastUrl: (data: PatchLastUrlData) => PartialStateUpdater<AppRouterSlice> = ({
  lastUrl,
}) => {
  return () => ({
    lastUrl,
  });
};
