export type Path = Array<string>;

export function createPath(path: Path): string {
  return path.join('/');
}

export function parsePath(path: string): Path {
  const items = path.split('/');
  return items.filter((item) => item && item.length > 0);
}

export function isPath(path: string | Path): path is Path {
  return Array.isArray(path);
}
