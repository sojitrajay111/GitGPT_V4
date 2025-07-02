import { useMemo } from "react";
import { useGetGitHubRepoBranchesQuery } from "@/features/githubApiSlice";

export function useGithubBranches(repoUrl) {
  // Parse owner and repo from the repoUrl
  const match = useMemo(() => repoUrl && repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/), [repoUrl]);
  const owner = match ? match[1] : null;
  const repo = match ? match[2].replace(/\.git$/, "") : null;

  const { data, isLoading, error } = useGetGitHubRepoBranchesQuery(
    owner && repo ? { owner, repo } : skipToken,
    { skip: !owner || !repo }
  );

  // The RTK endpoint returns { success, branches } or { branches } or []
  const branches = data?.branches || (Array.isArray(data) ? data : []);

  return { branches, loading: isLoading, error };
} 