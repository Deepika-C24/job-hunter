"use client";
import { useState } from "react";

interface WindowProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

function TitleButton({ onClick, label, red }: { onClick?: () => void; label: string; red?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-4 h-4 text-[10px] font-bold leading-none flex items-center justify-center
        border border-white border-r-[#808080] border-b-[#808080]
        active:border-[#808080] active:border-r-white active:border-b-white
        ${red ? "bg-[#c0c0c0] hover:bg-red-500 hover:text-white" : "bg-[#c0c0c0]"}`}
    >
      {label}
    </button>
  );
}

export function Window({ title, icon = "💾", children, className = "", width = "auto" }: WindowProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div
      className={`border-2 border-white border-r-[#808080] border-b-[#808080] bg-[#c0c0c0] shadow-[2px_2px_0px_#000] ${className}`}
      style={{ width, fontFamily: "Arial, sans-serif" }}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#000080] to-[#1084d0] px-1 py-0.5 select-none">
        <div className="flex items-center gap-1">
          <span className="text-xs">{icon}</span>
          <span className="text-white text-xs font-bold truncate">{title}</span>
        </div>
        <div className="flex gap-0.5">
          <TitleButton onClick={() => setMinimized(!minimized)} label="_" />
          <TitleButton label="□" />
          <TitleButton label="✕" red />
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <div className="p-2">
          {children}
        </div>
      )}
    </div>
  );
}
