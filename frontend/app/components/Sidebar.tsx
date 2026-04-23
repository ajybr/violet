"use client";

import { useRouter, usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";

import {
  Layers,
  FileText,
  Search,
  Home,
  Brackets,
  BrainCog,
  ScanSearch,
} from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  {
    id: "collections",
    label: "Collections",
    icon: Layers,
    href: "/collections",
  },
  { id: "docs", label: "Docs", icon: FileText, href: "/docs" },
  { id: "search", label: "Search", icon: Search, href: "/search" },
  { id: "embed", label: "Embed", icon: Brackets, href: "/embed" },
];
const demos = [
  {
    id: "semantic",
    label: "Semantic Search",
    icon: ScanSearch,
    href: "/semantic_search",
  },
  {
    id: "recommendation",
    label: "Recommendation Engine",
    icon: BrainCog,
    href: "/recommendation_engine",
  },
];

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarMenu className="">
            {tabs.map((t) => (
              <SidebarMenuItem key={t.id}>
                <SidebarMenuButton
                  isActive={pathname === t.href}
                  onClick={() => router.push(t.href)}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="truncate">{t.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Use Cases</SidebarGroupLabel>
          <SidebarMenu className="">
            {demos.map((d) => (
              <SidebarMenuItem key={d.id}>
                <SidebarMenuButton
                  isActive={pathname === d.href}
                  onClick={() => router.push(d.href)}
                >
                  <d.icon className="h-4 w-4" />
                  <span className="truncate">{d.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-3 w-full">
          <ModeToggle />
          <div>
            <div className="text-xs opacity-70 truncate">
              API: {process.env.NEXT_PUBLIC_API_BASE_URL}
            </div>
            <div className="text-xs opacity-70 truncate">
              API: {process.env.NEXT_PUBLIC_API_BASE_URL2}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
