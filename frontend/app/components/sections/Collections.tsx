"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "../../lib/api";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Collections() {
  const { data: names, isPending } = useQuery({
    queryKey: ["collections"],
    queryFn: () => get("/collections"),
  });

  const { data: infos } = useQuery({
    queryKey: ["collections-info", names],
    queryFn: async () => {
      if (!names) return [];
      return Promise.all(names.map((n: string) => get(`/collections/${n}`)));
    },
    enabled: !!names,
  });

  const rows = useMemo(() => infos || [], [infos]);

  return (
    <Card className="w-full p-4">
      <CardContent>
        {isPending ? (
          <div className="w-full flex justify-center">
            <div className="flex items-center justify-center bg-slate-300/10 rounded-lg h-fit space-x-2 px-4 py-2 max-w-fit">
              <Spinner />
              <div>Loading</div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dimension</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c: any) => (
                <TableRow key={c.name}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.dimension}</TableCell>
                  <TableCell>{c.distance}</TableCell>
                  <TableCell>{c.embedding_count}</TableCell>
                  <TableCell>
                    {new Date(c.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
