"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, MessageSquare, User } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Lectures", href: "/", icon: BookOpen },
    { name: "Search", href: "/search", icon: Search },
    { name: "Forum", href: "/forum", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 py-2 md:py-3 shadow-lg">
      <div className="max-w-xl mx-auto flex justify-around items-center px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive
                  ? "text-indigo-400 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${
                isActive ? "bg-indigo-500/10" : "bg-transparent"
              }`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-xs font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
