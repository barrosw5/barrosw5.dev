import type messages from "./messages/en.json";
import type { Locale } from "./routing";

// Type-safe translations: t("some.key") fails the typecheck if the key does
// not exist in en.json. The test in messages.test.ts keeps pt-PT.json in sync.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
