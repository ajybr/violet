"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { embedImg } from "../lib/embed_api";
import { api } from "../lib/api";
import { ImageCard } from "./ImageCard";

export default function RecommendationSystem() {
  const { data: imgs = [] } = useQuery({
    queryKey: ["imgs"],
    queryFn: () => fetch("/api/images").then((r) => r.json()),
  });
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [override, setOverride] = useState<string[] | null>(null);
  const pageSize = 20;

  const visible =
    override ?? imgs.slice((page - 1) * pageSize, page * pageSize);

  async function upvote(url: string) {
    setLoadingKey(url);
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));

    const { vector } = await embedImg(b64);

    const r = await api.post("/collections/images", {
      query: vector,
      k: 6,
    });

    const fname = url.split("/").pop();

    const raw = (r.data ?? [])
      .filter((x) => x.embedding?.metadata?.filename !== fname)
      .filter(
        (x, i, arr) =>
          i ===
          arr.findIndex(
            (y) =>
              y.embedding.id === x.embedding.id &&
              y.embedding.metadata.filename === x.embedding.metadata.filename,
          ),
      );

    const sims = raw.map((x) => `/images/${x.embedding.metadata.filename}`);

    setPage(1);

    setOverride((prev) => {
      const base = prev ?? imgs;
      const merged = [...sims, ...base];
      return Array.from(new Set(merged));
    });
    setLoadingKey(null);
  }

  return (
    <div className="flex justify-center items-center">
      <div className="space-y-4 p-4 w-fit">
        <div className="grid grid-cols-5 gap-3">
          {visible.map((url) => (
            <ImageCard
              key={url}
              url={url}
              loading={loadingKey === url}
              onClick={() => upvote(url)}
            />
          ))}{" "}
        </div>

        {!override && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setPage(Math.max(1, page - 1))}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>400</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() => setPage(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>{" "}
    </div>
  );
}
