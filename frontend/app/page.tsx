"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

const qc = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={qc}>
      <Dashboard />
    </QueryClientProvider>
  );
}
