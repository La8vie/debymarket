"use client";

export default function LoadingSpinner({ size = 40, color = "#4f46e5" }: { size?: number; color?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="animate-spin rounded-full border-2 border-t-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderColor: color,
          borderTopColor: 'transparent',
        }}
      ></div>
    </div>
  );
}
