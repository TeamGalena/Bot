import { optionalEnv } from "@teamgalena/shared/config";

const hash = optionalEnv("GIT_HASH");
const repo = optionalEnv("GIT_REPO");

export type GitMetadata = {
  hash: string;
  repo: string;
};

export const gitInfo: GitMetadata | null =
  hash !== null && repo !== null
    ? {
        hash,
        repo,
      }
    : null;
