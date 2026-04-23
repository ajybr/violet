"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import RecommendationSystem from "../components/RecommendationSystem";

export default function RecommendationEngine() {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() =>
              window.open(
                "https://huggingface.co/sentence-transformers/clip-ViT-B-32",
                "_blank",
              )
            }
          >
            model: <code>clip-ViT-B-32</code>
          </Button>
        </TooltipTrigger>

        <TooltipContent>CLIP by OpenAI + ViT</TooltipContent>
      </Tooltip>
      <RecommendationSystem />
    </>
  );
}
