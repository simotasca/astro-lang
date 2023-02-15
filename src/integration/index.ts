import type { AstroIntegration } from "astro";
import glob from "glob";
import configuration from "../utils/config";
import { INTEGRATION_NAME } from "../utils/constants";
import i18n from "./i18n";

export default function astroLang(): AstroIntegration {
  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:setup": ({ injectRoute, config, command }) => {
        // internationalize
        i18n.init(config.srcDir.pathname);
        i18n.internationalize();
        // inject routes
        glob
          .sync(`./${configuration.langFolder}/**/*.astro`)
          .forEach((page) => {
            const pattern = page
            .replace(`./${configuration.langFolder}`, "")
            .replace("index", "")
            .replace(".astro", "");
            injectRoute({ pattern, entryPoint: page });
          });
        // watch
        if (command === "dev") i18n.watch();
      },
    },
  };
}
