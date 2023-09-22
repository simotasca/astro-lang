import { config } from "./src/config";

export { default as Link } from "./src/components/Link.astro";
export { default as LangSwitch } from "./src/components/LangSwitch.astro";
export const lang = { ...config };
export * from "./src/lang";
