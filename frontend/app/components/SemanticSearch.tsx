"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchCodeIcon, Link as LinkIcon } from "lucide-react";
import { embedText } from "../lib/embed_api";
import { api } from "../lib/api";
import { Spinner } from "@/components/ui/spinner";

export default function SemanticSearch() {
  const [text, setText] = useState("");
  const [k, setK] = useState(3);
  const [rows, setRows] = useState([]);
  const [vector, setVector] = useState([]);
  const [loading, setLoading] = useState(false);
  const selected = "startups";

  async function run() {
    try {
      setLoading(true);
      const out = await embedText(text);
      setVector(out.vector);
      const r = await api.post(
        `http://localhost:8000/collections/${selected}`,
        {
          query: out.vector,
          k,
        },
      );
      setRows(r.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button variant={"outline"} className="w-fit">
            collections:
            {selected}
          </Button>
          <Input
            placeholder="text to embed"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Input
            placeholder="k"
            className="w-fit"
            type="number"
            min={1}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
          />
          <Button className="w-fit" onClick={run}>
            <SearchCodeIcon />
            search
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

        <div className="grid grid-cols-3 gap-4">
          {rows.map((r: any, i) => {
            const m = r.embedding.metadata;
            return (
              <Card key={i} className="h-fit">
                <CardHeader>
                  <div className="flex gap-4">
                    {m.images && (
                      <img
                        src={m.images}
                        alt={m.alt}
                        className="border w-fit rounded-full h-fit"
                      />
                    )}

                    <div className="flex justify-center  flex-col">
                      <CardTitle>{m.name}</CardTitle>
                      <CardDescription>{m.alt}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="ml-2">{m.description}</p>

                  {m.link && (
                    <Button
                      variant={"ghost"}
                      onClick={() => window.open(`${m.link}`, "_blank")}
                      className=" hover:text-blue-500 rounded-full ml-auto"
                    >
                      <LinkIcon size={16} />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
