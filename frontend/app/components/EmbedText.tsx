"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { embedText } from "../lib/embed_api";
import { Spinner } from "@/components/ui/spinner";
import { ArrowUpIcon } from "lucide-react";

export default function EmbedText() {
  const [text, setText] = useState("");
  const [vec, setVec] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  async function run() {
    try {
      setLoading(true);
      const out = await embedText(text);
      setVec(out.vector);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card className="p-4 space-y-4 w-full flex items-center">
      <div className="min-w-lg flex space-x-3 ">
        <Input
          placeholder="text…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={run} variant={"outline"} disabled={!text.trim()}>
          <ArrowUpIcon />
          embed
        </Button>
      </div>
      {loading && (
        <div className="w-full flex justify-center">
          <div className="flex items-center justify-center bg-slate-300/10 rounded-lg h-fit space-x-2 px-4 py-2 max-w-fit">
            <Spinner />
            <div>Loading</div>
          </div>
        </div>
      )}

      {vec?.length > 0 && (
        <Card className="p-4 space-y-3">
          <CardHeader>
            <CardTitle>dimensions: {vec ? vec.length : 0}</CardTitle>
          </CardHeader>

          <CardContent className="text-xs break-all">
            {vec && JSON.stringify(vec)}
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
