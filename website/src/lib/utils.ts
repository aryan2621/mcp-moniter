import { useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
