"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const items = [
  { title: "Snippets", href: "/snippets", icon: CodeIcon },
  { title: "Duels", href: "/duels", icon: KeyboardIcon },
  { title: "Landing", href: "/landing", icon: LayoutIcon },
  { title: "Analytics", href: "/analytics", icon: SearchIcon },
  { title: "New Post", href: "/posts/new", icon: KeyboardIcon },
] as const;

function AccountAvatar({ avatarUrl }: { avatarUrl: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!avatarUrl || failed) {
    return (
      <span className="inline-flex size-4 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-[9px] font-semibold text-stone-300">
        A
      </span>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt=""
      onError={() => setFailed(true)}
      className="size-4 rounded-full border border-stone-700 object-cover"
    />
  );
}

export function AppSidebar({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-md border border-stone-800 bg-stone-950 px-2.5 py-2">
          <div className="rounded-md border border-stone-700 bg-stone-900 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-xs text-stone-300">
            CF
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-stone-100">
              cfetch
            </p>
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
                      <HugeiconsIcon
                        icon={item.icon}
                        size={16}
                        strokeWidth={1.8}
                      />
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
              <AccountAvatar avatarUrl={avatarUrl} />
              <span>Accounts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pt-1"></div>
      </SidebarFooter>
    </Sidebar>
  );
}
