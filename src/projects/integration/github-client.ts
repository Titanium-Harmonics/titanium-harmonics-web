import type { RepositoryRegistration } from "../config/repository-registry.js";
import { githubApiCommitUrl, githubRawUrl } from "./github-urls.js";

export class GitHubRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = "GitHubRequestError";
  }
}

export interface GitHubClientOptions {
  fetch?: typeof globalThis.fetch;
  token?: string;
}

export class GitHubClient {
  readonly #fetch: typeof globalThis.fetch;
  readonly #headers: HeadersInit;

  constructor(options: GitHubClientOptions = {}) {
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "titanium-harmonics-web-build",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    };
  }

  async resolveRevision(registration: RepositoryRegistration): Promise<string> {
    const url = githubApiCommitUrl(registration);
    const response = await this.#fetch(url, { headers: this.#headers });
    if (!response.ok) throw new GitHubRequestError(`Could not resolve ${registration.ref}: ${response.status} ${response.statusText}`, response.status, url);
    const body = await response.json() as { sha?: unknown };
    if (typeof body.sha !== "string" || !/^[a-f0-9]{40}$/i.test(body.sha)) {
      throw new Error(`GitHub returned an invalid commit SHA for ${registration.owner}/${registration.repository}.`);
    }
    return body.sha;
  }

  async readText(
    registration: RepositoryRegistration,
    revision: string,
    path: string,
    options: { optional?: boolean } = {},
  ): Promise<string | undefined> {
    const url = githubRawUrl(registration, revision, path);
    const response = await this.#fetch(url, { headers: this.#headers });
    if (response.status === 404 && options.optional) return undefined;
    if (!response.ok) throw new GitHubRequestError(`Could not fetch ${path}: ${response.status} ${response.statusText}`, response.status, url);
    return response.text();
  }
}

