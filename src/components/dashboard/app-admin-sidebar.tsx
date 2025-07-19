"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Activity,
  BarChart3,
  MapPinCheck,
  RefreshCw,
  Rss,
  Server,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";
import { Switch } from "../ui/switch";
import { NavUser } from "./user-nav";

export function AppAdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      id: "overview",
      title: "Overview",
      icon: BarChart3,
    },
    {
      id: "crawler",
      title: "News Crawler",
      icon: RefreshCw,
    },
    {
      id: "sources",
      title: "RSS Sources",
      icon: Rss,
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: Activity,
    },
    {
      id: "system",
      title: "System",
      icon: Server,
    },
    {
      id: "users",
      title: "User Management",
      icon: Users,
    },
  ];

  const user = {
    name: "Shahjalal",
    email: "hello@shahjalal.me",
    avatar: "Shahjalal.jpg",
  };

  const activeModule = pathname.split("/")[2];

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <SidebarHeader className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-600 dark:to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
            <MapPinCheck className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            PinPoint News
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white dark:bg-gray-900">
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-gray-600 dark:text-gray-400 font-medium">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeModule === item.id}
                    onClick={() => router.push(`/dashboard/${item.id}`)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-6 rounded transition-all duration-200
                      ${
                        activeModule === item.id
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-l-4 border-gray-600 dark:border-gray-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                      }
                    `}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        activeModule === item.id
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
