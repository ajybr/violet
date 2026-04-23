"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { get } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSelectedCollection } from "../store/collection-select";

export function ComboboxCollection() {
  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => get("/collections"), // returns string[]
  });
  const [open, setOpen] = React.useState(false);
  const { selected, setSelected } = useSelectedCollection();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected
            ? collections.find((collection: string) => collection === selected)
            : "Select collection..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search collection..." className="h-9" />
          <CommandList>
            <CommandEmpty>No collection found.</CommandEmpty>
            <CommandGroup>
              {collections.map((collection: string) => (
                <CommandItem
                  key={collection}
                  value={collection}
                  onSelect={(currentValue) => {
                    setSelected(currentValue === selected ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {collection}
                  <Check
                    className={cn(
                      "ml-auto",
                      selected === collection ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
