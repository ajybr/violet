"use client";
import Page from "./Page.mdx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function Docs() {
  return (
    <div className=" flex justify-center  ">
      <article className="prose  max-w-4xl">
        <Page />
      </article>
    </div>
  );
}

const qc = new QueryClient();

export default function DocsPage() {
    return (
        <QueryClientProvider client={qc}>
            <Docs />
        </QueryClientProvider>
    )
}
