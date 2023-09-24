import { join } from "node:path";
import { readFileSync } from "node:fs";

const userConfig = JSON.parse(
  readFileSync(join(process.cwd(), "lang.config.json")).toString() || "{}"
);

function parseConfig(userConfig: any): {
  canonical: string;
  languages: string[];
} {
  return {
    canonical: userConfig.canonical || "en",
    languages: userConfig.languages || ["en"],
  };
}

export const config = parseConfig(userConfig);
