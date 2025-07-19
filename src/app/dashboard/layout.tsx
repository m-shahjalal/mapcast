"use client";

import { AppAdminSidebar } from "@/components/dashboard/app-admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const routes = pathname.split("/").slice(1);

  return (
    <SidebarProvider>
      <AppAdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:supports-[backdrop-filter]:bg-gray-900/60 dark:border-gray-800 sticky top-0 z-50 shadow-sm px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 dark:bg-gray-700"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {routes.map((r, i) => (
                <>
                  <BreadcrumbItem key={new Date().getTime()}>
                    <BreadcrumbPage className="capitalize text-gray-900 dark:text-gray-100">
                      <BreadcrumbLink
                        href={`/${routes.slice(0, i + 1).join("/")}`}
                      >
                        {r}
                      </BreadcrumbLink>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  {i !== routes.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block dark:text-gray-600" />
                  )}
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center space-x-4 ml-auto">
            <ThemeToggle />
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="bg-white/50 hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 dark:border-gray-600 dark:text-gray-200"
            >
              <Globe className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
