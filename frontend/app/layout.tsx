import { ThemeProvider } from "next-themes";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./components/Sidebar";
import AppThemeProvider from "./components/theme-provider";
import { useMDXComponents } from "./mdx-components";
import Header from "./components/Header";
import Providers from "./components/providers";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className="min-h-screen flex">
        <AppThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex-1 p-6 overflow-auto">
              <Providers>
                <Header />
                {children}
              </Providers>
            </div>
          </SidebarProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
export { useMDXComponents };
