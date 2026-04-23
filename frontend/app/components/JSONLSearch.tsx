"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function JSONLSearch() {
  const [items, setItems] = useState<string[]>([]);
  const [q, setQ] = useState("");

  async function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const txt = await f.text();
    const lines = txt.split("\n").filter(Boolean);

    const names = lines.map((l) => {
      try {
        const obj = JSON.parse(l);
        return obj.name + " " + obj.description || null;
      } catch {
        return null;
      }
    });

    setItems(names.filter(Boolean));
  }

  const results = q
    ? items.filter((n) => n.toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <Card className="p-4 space-y-4">
      <CardContent className="space-y-4">
        <Input type="file" accept=".jsonl" onChange={loadFile} />

        <div className="flex gap-2">
          <Input
            placeholder="search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button>
            <Search size={16} />
          </Button>
        </div>

        <div className="grid gap-2">
          {results.map((r, i) => (
            <div key={i} className="p-2 rounded bg-slate-100 dark:bg-slate-800">
              {r}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
