import { AstroLangConfiguration } from "./config";

export const INTEGRATION_NAME = "astro-lang";

export const CONFIG_F_NAME = "astro-lang.config.json";
export const DEFAULT_CONFIG: AstroLangConfiguration = {
  canonical: "en",
  lang: [],
  langFolder: ".lang",
  base: "pages",
  srcDir: "src"
};

export const ASTRO_IMPORT_REGEXP = /(import\s+.*["'])(\..*)(["'])/g;
export const ASTRO_GLOB_REGEXP = /(Astro.glob\(["'])(\..*)(["']\))/g;
