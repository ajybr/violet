"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPlus, Loader2 } from "lucide-react";

export function ImageCard({
  url,
  loading,
  onClick,
}: {
  url: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Card className="w-fit border p-1 rounded-lg backdrop-blur-3xl">
      <img src={url} className="w-60 h-60 object-cover rounded-lg" />

      <Button
        variant="outline"
        size="lg"
        className="ml-auto w-fit hover:text-[#D71921] hover:shadow-lg hover:shadow-[#D71921]/20"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" /> : <HeartPlus />}
      </Button>
    </Card>
  );
}
