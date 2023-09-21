import { join } from "path";
import { config } from "./config";

/**
 * Ottiene il contenuto di un json di traduzione in base a url e lingua.
 *
 * ( _Funziona anche se l'url contiene una lingua differente da quella specificata_ )
 */
export async function getTranslation(url: URL, lang: string) {
  let { pathname: currPathname } = getUrlInfo(url);

  if (currPathname.endsWith("/")) {
    currPathname += "index";
  }
  currPathname = currPathname.slice(1);

  const data: any = {};
  for (const language of config.languages) {
    const translation = await importJson(
      join(process.cwd(), "src", "lang", currPathname, language + ".json")
    );
    const ui = await importJson(
      join(process.cwd(), "src", "lang", "ui", language + ".json")
    );
    data[language] = { ...translation, ui };
  }

  return function t(key: string) {
    return walk(data[lang], key) || walk(data[config.canonical], key) || "";
  };
}

async function importJson(path: string) {
  return (
    await import(path /* @vite-ignore */).catch(() => {
      return { default: {} };
    })
  )?.default;
}

function walk(obj: any, key: string) {
  const keys = key.split(".");
  let level = { ...obj };

  for (const levelKey of keys) {
    if (!levelKey) continue;
    level = level[levelKey];
    if (!level) return null;
  }

  return level;
}

/**
 * crea un link a una traduzione a partire da un pathname generico e dalla lingua
 */
export function getLangLink(pathname: string, lang: string) {
  if (lang == config.canonical) {
    return pathname;
  } else {
    return "/" + lang + pathname;
  }
}

/**
 * ritorna il pathname generico e la lingua di un url
 */
export function getUrlInfo(url: URL): { lang: string; pathname: string } {
  const lang = getUrlLang(url);

  let pathname = url.pathname;
  if (lang !== config.canonical) {
    pathname = url.pathname.replace(`/${lang}`, "") || "/";
  }
  if (pathname != "/" && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  return { lang, pathname };
}

/**
 * ritorna la lingua di un url
 */
export function getUrlLang(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (config.languages.includes(lang)) {
    return lang;
  } else {
    return config.canonical;
  }
}
