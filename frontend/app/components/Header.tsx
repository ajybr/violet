"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function Header() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const basePy =
    process.env.NEXT_PUBLIC_API_BASE_URL2 || "http://localhost:8001";

  const { data, isLoading, isError } = useQuery({
    // fetch health rs
    queryKey: ["alive"],
    queryFn: async () => {
      const r = await axios.get(`${base}/health`);
      return r.data;
    },
    refetchInterval: 5000,
  });
  const { dataPy, isLoadingPy, isErrorPy } = useQuery({
    // fetch health py
    queryKey: ["alive"],
    queryFn: async () => {
      const r = await axios.get(`${basePy}/`);
      return r.data;
    },
    refetchInterval: 5000,
  });

  const ok = isLoading ? null : !isError;
  const okPy = isLoadingPy ? null : !isErrorPy;

  return (
    <header className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-semibold">Vector DB Dashboard</h1>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            API:
            <div
              className={`h-3 w-3 rounded-full ${
                ok === null ? "bg-gray-400" : ok ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <code>{base}</code>
            <div
              className={`h-3 w-3 rounded-full ${
                ok === null ? "bg-gray-400" : ok ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <code>{basePy}</code>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {ok === null
            ? "checking..."
            : ok
              ? "all systems functional"
              : "backend not functional"}
        </TooltipContent>{" "}
        <TooltipContent>
          {okPy === null
            ? "checking..."
            : okPy
              ? "all systems functional"
              : "backend not functional"}
        </TooltipContent>
      </Tooltip>
    </header>
  );
}
