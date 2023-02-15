/**
 * LIMITAZIONI:
 * * Internazionalizza solo files .astro (mancano .md e .mdx)
 * * In dev mode, quando viene aggiunto un file nuovo, le versioni tradotte non sono disponibili.
 *     bisogna riavviare il comando dev
 * * Non traduce i routes
 */

import configuration from "./utils/config";
import astroLang from "./integration/index";
import { getLangRegistry } from "./components/lang-registry";

export default astroLang;

export function getLang(url: URL) {
  const base = url.pathname.split("/")[1];
  if (configuration.lang.includes(base)) return base;
  else return configuration.canonical;
}

export function getCanonical(url: URL) {
  const urlOk = url.pathname + (url.pathname.endsWith("/") ? "" : "/");

  const lang = getLang(url);
  if (lang == configuration.canonical) return url.pathname;

  const registry = getLangRegistry();
  return Object.keys(registry).find((page) => registry[page][lang] == urlOk);
}
