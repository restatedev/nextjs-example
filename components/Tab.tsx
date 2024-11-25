"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export function Tab({ children, href }: PropsWithChildren<{ href: string }>) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      prefetch={false}
      href={href}
      className={`${
        isActive
          ? "bg-gray-200 text-gray-800"
          : "text-gray-600 hover:text-gray-800"
      } rounded-md px-3 py-2 text-sm font-medium`}
    >
      {children}
    </Link>
  );
}
