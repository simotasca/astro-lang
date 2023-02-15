import glob from "glob";
import { eachAlternate, translateURL } from "../integration/i18n";
import configuration from "../utils/config";

let translationRegistry: any;

function createLangRegistry() {
  translationRegistry = {};
  glob
    .sync(`./${configuration.srcDir}/${configuration.base}/**/*.astro`)
    .map(
      (page) =>
        page
          .replace(`./${configuration.srcDir}/${configuration.base}`, "")
          .replace("/index", "")
          .replace(".astro", "") + "/"
    )
    .forEach((url) => {
      translationRegistry[url] = {};
      eachAlternate((lang) => {
        translationRegistry[url][lang] = translateURL(url, lang);
      });
    });
  return translationRegistry;
}

export function getLangRegistry() {
  if (!translationRegistry) return createLangRegistry();
  else return translationRegistry;
}
