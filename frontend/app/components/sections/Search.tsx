import { useState } from "react";
import { useCollectionStore } from "@/app/store/collections";
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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// fetch available collections using tanstack + axios --------------------
function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const r = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/collections`,
      );
      return r.data as string[];
    },
  });
}

export default function Search() {
  const { data: collections = [] } = useCollections();

  const [collection, setCollection] = useState("");
  const [text, setText] = useState("");
  const [k, setK] = useState(3);
  const [rows, setRows] = useState([]);

  // run search ----------------------------------------------------------
  async function run() {
    try {
      // 1. get vector from python
      const e = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const { vector } = await e.json();

      // 2. send query to backend
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/collections/${collection}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: vector, k }),
        },
      );

      setRows(await r.json());
    } catch {
      setRows([]);
    }
  }
  const valid = collections.includes(collection);

  return (
    <Card className="p-4 space-y-4">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className={!valid && collection ? "border-red-500" : ""}
          />

          <Input
            placeholder="text to embed"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Input
            placeholder="k"
            type="number"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
          />
        </div>

        <Button onClick={run} disabled={!valid || !text.trim()}>
          search
        </Button>

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
