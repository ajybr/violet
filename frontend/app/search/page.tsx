"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { embedText } from "../lib/embed_api";
import { ComboboxCollection } from "../components/ComboboxCollection";
import { SearchCodeIcon } from "lucide-react";
import { api } from "../lib/api";
import { useSelectedCollection } from "../store/collection-select";

function Search() {
  const [text, setText] = useState("");
  const [k, setK] = useState(3);
  const [rows, setRows] = useState([]);
  const [vector, setVector] = useState([]);
  const [loading, setLoading] = useState(false);
  const selected = useSelectedCollection((s) => s.selected);

  async function run() {
    try {
      setLoading(true);
      const out = await embedText(text);
      setVector(out.vector);
    } finally {
      setLoading(false);
    }
    try {
      const r = await api.post(
        `http://localhost:8000/collections/${selected}`,
        { query: vector, k },
      );

      setRows(await r.data);
    } catch {
      setRows([]);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div>
            <ComboboxCollection />
          </div>
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
        {/* {vector?.length > 0 && <Card>{JSON.stringify(vector)}</Card>} */}

        {loading && <div>Loading.....</div>}
        {rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>score</TableHead>
                <TableHead>id</TableHead>
                <TableHead>image</TableHead>
                <TableHead>alt</TableHead>
                <TableHead>name</TableHead>
                <TableHead>description</TableHead>
                <TableHead>link</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r: any, i) => (
                <TableRow key={i}>
                  <TableCell>{r.score}</TableCell>
                  <TableCell>{r.embedding.id}</TableCell>
                  <TableCell>{r.embedding.metadata.images}</TableCell>
                  <TableCell>{r.embedding.metadata.alt}</TableCell>
                  <TableCell>{r.embedding.metadata.name}</TableCell>
                  <TableCell>{r.embedding.metadata.description}</TableCell>
                  <TableCell>{r.embedding.metadata.link}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

const qc = new QueryClient();

export default function SearchPage() {
  return (
    <QueryClientProvider client={qc}>
      <Search />
    </QueryClientProvider>
  );
}
