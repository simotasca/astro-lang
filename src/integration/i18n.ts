import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import glob from "glob";
import chokidar from "chokidar";
import { dirname, join, normalize, relative, resolve, sep } from "path";
import configuration from "../utils/config";
import { ASTRO_GLOB_REGEXP, ASTRO_IMPORT_REGEXP } from "../utils/constants";
import { cwd } from "process";

let astroSrcDir: string = "";
let astroSrcUrl: string = "";

export function eachAlternate(cb: (lang: string) => void) {
  configuration.lang.forEach((lang) => {
    if (lang == configuration.canonical) return;
    cb(lang);
  });
}

export function translateURL(url: string, lang: string) {
  if (!configuration.routes || !configuration.routes[lang]) return `/${lang}${url}`;

  if (url == "/") return `/${lang}/`;

  const split = url.split("/").slice(1);
  let nested = configuration.routes[lang];
  let translation = `/${lang}`;

  for (let i = 0; i < split.length; i++) {
    const urlChunk = split[i];

    const withoutTranslation = (i: number) =>
      [translation, ...split.slice(i)].join("/");

    // no translation found
    if (!Object.keys(nested).includes(urlChunk)) {
      return withoutTranslation(i);
    }

    nested = nested[urlChunk];

    // no more sub path translations
    if (typeof nested === "string") {
      translation = [translation, nested].join("/");
      return withoutTranslation(i + 1);
    }

    // translate chunk and keep on
    if (Object.keys(nested).includes("index")) {
      translation = [translation, nested["index"]].join("/");
    } else translation = [translation, urlChunk].join("/");
  }

  return translation;
}

export function translateRoute(route: string, lang: string) {
  if (!configuration.routes || !configuration.routes[lang]) return route;

  const split = route.replace(".astro", "").replace("index", "").split(sep);

  if (split[0] === "") return "index.astro";

  let nested = configuration.routes[lang];
  let translation = "";

  for (let i = 0; i < split.length; i++) {
    const urlChunk = split[i];

    const withoutTranslation = (i: number) =>
      join(translation, ...split.slice(i)) + ".astro";

    // no translation found
    if (!Object.keys(nested).includes(urlChunk)) {
      return withoutTranslation(i);
    }

    nested = nested[urlChunk];

    // no more sub path translations
    if (typeof nested === "string") {
      translation = join(translation, nested);
      return withoutTranslation(i + 1);
    }

    // translate chunk and keep on
    if (Object.keys(nested).includes("index")) {
      translation = join(translation, nested["index"]);
    } else translation = join(translation, urlChunk);
  }

  return translation + ".astro";
}

export function toLangPath(path: string, lang: string) {
  const astroPath = relative(astroSrcDir, normalize(path));
  const translated = translateRoute(astroPath, lang);
  return join(configuration.langFolder, lang, translated);
}

export function toUserTranslationPath(path: string, lang: string) {
  const astroPath = relative(astroSrcDir, normalize(path));
  return join(astroSrcDir, lang, astroPath);
}

function hasUserTranslations(path: string) {
  const found: string[] = [];
  eachAlternate((lang) => {
    const userTransPath = toUserTranslationPath(path, lang);
    if (existsSync(userTransPath)) found.push(lang);
  });
  return found.length > 0 ? found : false;
}

export function isLangPage(path: string) {
  const astroPath = relative(astroSrcDir, path);
  const splitPath = astroPath.split(sep);
  if (!configuration.lang.includes(splitPath[0])) return false;
  const canonicalPath = join(
    astroSrcDir,
    astroPath.replace(splitPath[0] + sep, "")
  );
  if (!existsSync(canonicalPath)) return false;
  return splitPath[0];
}

function i18nPagePaths(page: string, copyPath: string) {
  return (_, before: string, relativePath: string, after: string) => {
    const resolved = relative(cwd(), resolve(dirname(page), relativePath));
    const relativized = relative(dirname(copyPath), resolved).replaceAll(
      "\\",
      "/"
    );
    return `${before}${relativized}${after}`;
  };
}

function pageI18n(page: string) {
  const pagePath = normalize(page);

  // exclude user translations
  if (isLangPage(pagePath)) return;
  const userTrans = hasUserTranslations(page);

  eachAlternate((lang) => {
    // do not generate pages translated by the user
    if (userTrans && userTrans.includes(lang)) return;

    const copyPath = toLangPath(pagePath, lang);

    // create dir if not exist
    try {
      mkdirSync(dirname(copyPath), { recursive: true });
    } catch {}

    // create file with adjusted imports
    const pageContent = readFileSync(pagePath)
      .toString()
      .replaceAll(ASTRO_IMPORT_REGEXP, i18nPagePaths(pagePath, copyPath))
      .replaceAll(ASTRO_GLOB_REGEXP, i18nPagePaths(pagePath, copyPath));
    writeFileSync(copyPath, pageContent);
  });
}

function watch() {
  chokidar
    .watch(`./${astroSrcUrl}/.`, { ignoreInitial: true })
    .on("all", () => internationalize());
  // .on("addDir", watchAddDir)
  // .on("add", pageI18n)
  // .on("change", pageI18n)
  // .on("unlink", watchUnlink)
  // .on("unlinkDir", watchUnlink);
}

function internationalize() {
  // delete all existing files
  try {
    rmSync(configuration.langFolder, { recursive: true, force: true });
  } catch {}

  // create all pages
  glob.sync(`./${astroSrcUrl}/**/*.astro`).forEach((page) => pageI18n(page));
}

function init(astroSrc: string) {
  astroSrcDir = join(relative(cwd(), normalize(astroSrc.slice(1))), "pages");
  astroSrcUrl = astroSrcDir.replace("\\", "/");
}

export default {
  watch,
  init,
  internationalize,
};
