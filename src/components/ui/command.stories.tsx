import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./command";

const meta = {
  title: "UI/Command",
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A searchable list (the command palette puts this inside a dialog). */
export const Default: Story = {
  render: () => (
    <Command className="max-w-sm border">
      <CommandInput placeholder="Pesquisar" />
      <CommandList>
        <CommandEmpty>—</CommandEmpty>
        <CommandGroup heading="Grupo">
          <CommandItem>Um</CommandItem>
          <CommandItem>
            Dois
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
