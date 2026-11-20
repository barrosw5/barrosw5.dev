import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Welcome } from "@/components/Welcome";

export default function HomePage() {
  return (
    <>
      {/* Temporary: moves into the site header in the "base layout" step */}
      <header className="mx-auto flex w-full max-w-page items-center justify-end gap-1 px-gutter py-4">
        <ThemeToggle />
        <LanguageSwitcher />
      </header>
      <Welcome />
    </>
  );
}
