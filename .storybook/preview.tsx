import type { Preview } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import "../src/app/globals.css";
import en from "../src/i18n/messages/en.json";
import pt from "../src/i18n/messages/pt.json";
import { languageTags, routing, type Locale } from "../src/i18n/routing";
import { geistSans, geistMono } from "../src/lib/fonts";

document.documentElement.classList.add(geistSans.variable, geistMono.variable);

const messages: Record<Locale, typeof en> = { en, pt };

const preview: Preview = {
  // Language switcher in the Storybook toolbar. A story can pin a language
  // with `globals: { locale: "pt" }`.
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
  },
  initialGlobals: {
    locale: routing.defaultLocale,
  },

  decorators: [
    (Story, context) => {
      const locale = context.globals.locale as Locale;
      document.documentElement.lang = languageTags[locale];
      return (
        <NextIntlClientProvider
          locale={locale}
          messages={messages[locale]}
          timeZone="Europe/Lisbon"
        >
          <Story />
        </NextIntlClientProvider>
      );
    },
  ],

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
