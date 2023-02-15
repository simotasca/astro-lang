import { existsSync, readFileSync } from "fs";
import { CONFIG_F_NAME, DEFAULT_CONFIG } from "./constants";

export interface AstroLangConfiguration {
  canonical: string;
  lang: string[];
  routes?: [];
  langFolder: string;
  base: string;
  srcDir: string;
}

const configuration = (() => {
  const userConfig = existsSync(CONFIG_F_NAME)
    ? JSON.parse(readFileSync(CONFIG_F_NAME).toString())
    : {};
  const config = Object.assign({}, DEFAULT_CONFIG, userConfig);
  if (!config.lang.includes(config.canonical)) {
    config.lang.push(config.canonical);
  }
  return config as AstroLangConfiguration;
})();

export default configuration;
