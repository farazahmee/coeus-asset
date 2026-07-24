import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, className, ...p }: IconProps) {
  return { width: size, height: size, className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p };
}

export function IconLaptop(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M2 20h20" />
    </svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconFolder(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconBox(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export function IconMonitor(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function IconGrid(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function IconSubscription(p: IconProps) {
  // Card + recurring-cycle arrow — reads as "recurring billing".
  return (
    <svg {...base(p)}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M15 15.5a2.5 2.5 0 1 1-.7-1.7" />
      <path d="M15 13v2h-2" />
    </svg>
  );
}

const MAP: Record<string, (p: IconProps) => ReactNode> = {
  laptop: IconLaptop,
  users: IconUsers,
  folder: IconFolder,
  box: IconBox,
  monitor: IconMonitor,
  grid: IconGrid,
  subscription: IconSubscription,
};

export function SheetIcon({
  name,
  ...p
}: IconProps & { name?: string | null | undefined }) {
  const C = MAP[name || "folder"] || IconFolder;
  return <>{C(p)}</>;
}

export const ICON_OPTIONS = ["laptop", "users", "folder", "box", "monitor", "grid"] as const;
