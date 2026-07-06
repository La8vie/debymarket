"use client";

import { tailChase } from "ldrs";

tailChase.register();

export default function LoadingSpinner({ size = 40, color = "#4f46e5" }: { size?: number; color?: string }) {
  return (
    <div className="flex items-center justify-center">
      <l-tail-chase size={size.toString()} speed="1.75" color={color}></l-tail-chase>
    </div>
  );
}
