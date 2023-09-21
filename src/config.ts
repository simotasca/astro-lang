import { join } from "path";

const userConfig = (
  await import(join(process.cwd(), "lang.config.ts")/* @vite-ignore */).catch(() => ({
    default: {},
  }))
).default;

console.log(userConfig);

function parseConfig(userConfig: any) {
  return {
    canonical: userConfig.canonical || "en",
    languages: userConfig.languages || ["en"],
  };
}

export const config = parseConfig(userConfig);
