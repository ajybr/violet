"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EmbedText from "../components/EmbedText";
import EmbedImage from "../components/EmbedImage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";

export default function EmbedCard() {
  return (
    <div className="p-6">
      <Tabs defaultValue="text" className="w-full">
        <div className="flex justify-between">
          <TabsList className="grid grid-cols-2 w-lg">
            <TabsTrigger value="text">text</TabsTrigger>
            <TabsTrigger value="image">image</TabsTrigger>
          </TabsList>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-fit ml-auto gap-2"
                onClick={() =>
                  window.open(
                    "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
                    "_blank",
                  )
                }
              >
                model: <code>all-MiniLM-L6-v2</code>
              </Button>
            </TooltipTrigger>

            <TooltipContent>sentence-transformers</TooltipContent>
          </Tooltip>
        </div>

        <TabsContent value="text">
          <EmbedText />
        </TabsContent>

        <TabsContent value="image">
          <EmbedImage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
