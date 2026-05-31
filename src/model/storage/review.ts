import { ISO8601String } from '../utils';

export type ReviewStorage = {
  path: string;
  name: string;
  reviewed: ISO8601String;
  result: string;
};
