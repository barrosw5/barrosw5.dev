import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Welcome } from "@/components/Welcome";

export default function HomePage() {
  return (
    <>
      {/* Temporary: moves into the site header in the "base layout" step */}
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>
      <Welcome />
    </>
  );
}
