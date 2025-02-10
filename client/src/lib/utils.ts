import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (address: string, maxLength = 6) => {
  return `${address.slice(0, maxLength)}...${address.slice(-maxLength)}`;
};
