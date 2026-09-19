import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "08:00" → "8:00 AM" */
export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** ISO timestamp → "8:04 AM" */
export function formatClockTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** ISO timestamp → "Tue, 15 Sep · 8:04 AM" */
export function formatStamp(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })} · ${formatClockTime(iso)}`;
}

/** Human relative time: "2 hours ago", "just now" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function periodIconHint(period: string): string {
  switch (period) {
    case "Morning":
      return "🌅";
    case "Afternoon":
      return "☀️";
    case "Evening":
      return "🌇";
    case "Night":
      return "🌙";
    default:
      return "💊";
  }
}
