export type Path = Array<string>;

export function createPath(path: Path): string {
  return path.join('/');
}

export function parsePath(path: string): Path {
  return path.split('/').filter((item) => item && item.length > 0);
}

export function isPath(path: string | Path): path is Path {
  return Array.isArray(path);
}

export function getPath(path: string | Path): Path {
  if (isPath(path)) return path;
  return parsePath(path);
}
