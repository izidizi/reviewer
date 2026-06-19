export interface AppRouterSlice {
  vault: string | null;
  lastUrl: string | null;
}

export const initialAppRouterSlice: AppRouterSlice = {
  vault: null,
  lastUrl: null,
};

export function isAppRouterState(data: unknown): data is AppRouterSlice {
  const vault = (data as AppRouterSlice).vault;
  const lastUrl = (data as AppRouterSlice).lastUrl;
  if (
    (typeof vault === 'string' || vault === null) &&
    (typeof lastUrl === 'string' || lastUrl === null)
  )
    return true;

  return false;
}
