import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Welcome } from "@/components/Welcome";

export default function HomePage() {
  return (
    <>
      {/* Temporary: moves into the site header in the "base layout" step */}
      <header className="flex items-center justify-end gap-2 p-4">
        <ThemeToggle />
        <LanguageSwitcher />
      </header>
      <Welcome />
    </>
  );
}
