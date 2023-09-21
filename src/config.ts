import { join } from "path";

const userConfig = (
  await import(join(process.cwd(), "lang.config.js") /* @vite-ignore */).catch(
    () => {
      return { default: {} };
    }
  )
).default;

function parseConfig(userConfig: any) {
  return {
    canonical: userConfig.canonical || "en",
    languages: userConfig.languages || ["en"],
  };
}

export const config = parseConfig(userConfig);
