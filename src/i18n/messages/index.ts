import type { Locale } from "../routing";

import en from "./en.json";
import pt from "./pt.json";

/**
 * All translations, by language. For Storybook and tests: the site itself
 * loads only the current language's file (see `src/i18n/request.ts`).
 *
 * In a story: `messages[globals.locale].theme.dark` is the text the component
 * shows for that key in the toolbar language.
 */
export const messages: Record<Locale, typeof en> = { en, pt };
