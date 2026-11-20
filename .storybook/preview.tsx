import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { useEffect, useGlobals } from "storybook/preview-api";
import "../src/app/globals.css";
import { messages } from "../src/i18n/messages";
import { languageTags, routing, type Locale } from "../src/i18n/routing";
import { geistSans, geistMono } from "../src/lib/fonts";
import {
  getThemePreference,
  setThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "../src/theme/theme";

document.documentElement.classList.add(geistSans.variable, geistMono.variable);

/**
 * Language: gives every story the translations of the toolbar language, and
 * makes Storybook behave like the real site:
 * - the current URL gets the language prefix (a story on `/en/wishlist`
 *   becomes `/pt/wishlist` when the toolbar is on Português)
 * - clicking a link to another language (LanguageSwitcher) switches the
 *   toolbar language. Storybook's fake <Link> doesn't navigate, so we listen
 *   for the click ourselves.
 */
const LocaleDecorator: Decorator = (Story, context) => {
  const [, updateGlobals] = useGlobals();
  const locale = context.globals.locale as Locale;
  document.documentElement.lang = languageTags[locale];

  // The router mock only exists in stories with `nextjs.appDirectory: true`
  if (context.parameters.nextjs?.appDirectory) {
    const storyPath: string =
      context.parameters.nextjs.navigation?.pathname ?? "/";
    const [, first, ...rest] = storyPath.split("/");
    const path = hasLocale(routing.locales, first)
      ? `/${rest.join("/")}`
      : storyPath;
    usePathname.mockReturnValue(`/${locale}${path === "/" ? "" : path}`);
  }

  useEffect(() => {
    const switchOnLanguageLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.("a[href]");
      const target = link?.getAttribute("href")?.split("/")[1];
      if (hasLocale(routing.locales, target) && target !== locale) {
        updateGlobals({ locale: target });
      }
    };
    document.addEventListener("click", switchOnLanguageLink);
    return () => document.removeEventListener("click", switchOnLanguageLink);
  }, [locale, updateGlobals]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="Europe/Lisbon"
    >
      <Story />
    </NextIntlClientProvider>
  );
};

/**
 * Theme: the toolbar theme is the visitor's saved choice, so the page colours
 * and ThemeToggle always agree. Choosing in ThemeToggle updates the toolbar.
 */
const ThemeDecorator: Decorator = (Story, context) => {
  const [, updateGlobals] = useGlobals();
  const theme = context.globals.theme as ThemePreference;

  // Only when the toolbar value changes (or the story opens), not on every
  // render, so a click in ThemeToggle is not undone by the next render
  useEffect(() => {
    if (getThemePreference() !== theme) setThemePreference(theme);
  }, [theme]);

  useEffect(
    () =>
      subscribeToTheme(() => {
        const chosen = getThemePreference();
        if (chosen !== theme) updateGlobals({ theme: chosen });
      }),
    [theme, updateGlobals],
  );

  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Language",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "pt", title: "Português" },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: "Theme",
      toolbar: {
        icon: "contrast",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "system", title: "System", icon: "browser" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: routing.defaultLocale,
    // Fixed (not "system") so stories look the same on every machine
    theme: "light",
  },

  decorators: [ThemeDecorator, LocaleDecorator],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
