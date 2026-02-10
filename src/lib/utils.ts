import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getRedirectPath = (role?: string) => {
  const r = role?.toLowerCase();
  if (r === "admin") return "/admin/users";
  if (r === "superviseur") return "/superviseur";
  if (r === "dg" || r === "dc") return "/dg";
  if (r === "regional") return "/regional";
  if (r === "chef_zone") return "/chef-zone";
  return "/login";
};