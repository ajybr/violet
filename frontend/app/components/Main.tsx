"use client";
import Collections from "./sections/Collections";
import Docs from "./sections/Docs";
import Search from "./sections/Search";
import { useUI } from "../store/ui";
import Header from "./Header";
export default function Main() {
  const { tab } = useUI();
  return (
    <main className="rounded-2xl h-screen  backdrop-blur-3xl flex-1 p-6 overflow-auto space-y-6">
      <Header />
      {tab === "collections" && <Collections />}
      {tab === "docs" && <Docs />}
      {tab === "search" && <Search />}
    </main>
  );
}
