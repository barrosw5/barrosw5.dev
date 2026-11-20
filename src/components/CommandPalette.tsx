"use client";

import { ArrowUpRight, Languages, Moon, Search, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { navIcons } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useCommandPalette } from "@/hooks/useCommandPalette";

/**
 * A search box over everything you can do on the site, opened with ⌘K on a
 * Mac or Ctrl+K elsewhere (or by clicking its button, which shows the right
 * shortcut for your system). Type to filter, ↑↓ to move, Enter to run, Esc
 * to close.
 */
export function CommandPalette({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const t = useTranslations("commandPalette");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tLanguages = useTranslations("languageSwitcher.languages");
  const palette = useCommandPalette(defaultOpen);
  const modifier = palette.isMac ? "⌘" : "Ctrl";

  return (
    <>
      <Button
        // Outline: a subtle border, so it reads as a search box
        variant="outline"
        onClick={() => palette.setOpen(true)}
        // Tells screen readers the shortcut, in their own notation
        aria-keyshortcuts={palette.isMac ? "Meta+K" : "Control+K"}
        title={t("open")}
        className="h-10 gap-2 rounded-full pr-2 pl-3 text-muted-foreground"
      >
        <Search aria-hidden />
        {/* Screen readers hear "Open the command palette Ctrl K": the name,
            then the keys that are on screen */}
        <span className="sr-only">{t("open")}</span>
        {/* Until the browser says which system it is, keep the space */}
        <KbdGroup className={palette.isMac === null ? "invisible" : undefined}>
          <Kbd>{modifier}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={palette.open}
        onOpenChange={palette.setOpen}
        title={t("title")}
        description={t("description")}
        // Opens with a quick fade + slight zoom, unless the visitor asked
        // their system to reduce motion
        className="motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none"
      >
        <Command>
          <CommandInput placeholder={t("placeholder")} />
          {/* Tall enough to show every command without scrolling */}
          <CommandList className="max-h-96">
            <CommandEmpty>{t("empty")}</CommandEmpty>

            <CommandGroup heading={t("groups.pages")}>
              {palette.pages.map(({ id, href, isCurrent }) => {
                const Icon = navIcons[id];
                return (
                  <CommandItem key={id} onSelect={() => palette.goTo(href)}>
                    <Icon aria-hidden />
                    {tNav(id)}
                    {isCurrent && <CommandShortcut>{t("current")}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading={t("groups.preferences")}>
              <CommandItem onSelect={palette.toggleTheme}>
                {palette.isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
                {palette.isDark ? t("light") : t("dark")}
              </CommandItem>
              <CommandItem onSelect={palette.switchLanguage}>
                <Languages aria-hidden />
                {t("language", { language: tLanguages(palette.language.locale) })}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading={t("groups.links")}>
              {palette.contacts.map(({ id, href }) => (
                <CommandItem key={id} onSelect={() => palette.openLink(href)}>
                  <ArrowUpRight aria-hidden />
                  {tFooter(`contacts.${id}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
