"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeIcon,
  LayoutIcon,
  SearchIcon,
  KeyboardIcon,
} from "@hugeicons/core-free-icons";
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
} from "@/components/ui/sidebar";

const items = [
  { title: "Snippets", href: "/snippets", icon: CodeIcon },
  { title: "Landing", href: "/landing", icon: LayoutIcon },
  { title: "Posts", href: "/posts", icon: SearchIcon },
  { title: "New Post", href: "/posts/new", icon: KeyboardIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-md border border-stone-800 bg-stone-950 px-2.5 py-2">
          <div className="rounded-md border border-stone-700 bg-stone-900 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-xs text-stone-300">
            CF
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-stone-100">cfetch</p>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wide text-stone-500">
              navigation
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/snippets" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.href} />}
                      className="font-[family-name:var(--font-geist-mono)] text-xs"
                    >
                      <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/account")}
              render={<Link href="/account" />}
              className="font-[family-name:var(--font-geist-mono)] text-xs"
            >
              <Image
                src="/next.svg"
                alt="Account avatar"
                width={16}
                height={16}
                className="rounded-sm border border-stone-700 bg-stone-950 p-0.5"
              />
              <span>Accounts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 pt-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wide text-stone-500">
          cmd+b to toggle
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
