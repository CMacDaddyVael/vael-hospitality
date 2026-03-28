import type { PMSAdapter, PMSCredentials } from "./types";
import { MewsAdapter } from "./mews/adapter";
import type { MewsCredentials } from "./mews/types";

export function getAdapter(provider: string, credentials: PMSCredentials): PMSAdapter {
  switch (provider) {
    case "mews":
      return new MewsAdapter(credentials as unknown as MewsCredentials);
    default:
      throw new Error(`Unsupported PMS provider: ${provider}`);
  }
}
