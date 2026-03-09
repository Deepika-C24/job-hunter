import { RetroButton } from "./Button";

interface DialogProps {
  title: string;
  message: string;
  icon?: string;
  onOk?: () => void;
  onCancel?: () => void;
  show: boolean;
}

export function RetroDialog({ title, message, icon = "⚠️", onOk, onCancel, show }: DialogProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="border-2 border-white border-r-[#808080] border-b-[#808080] bg-[#c0c0c0] shadow-[3px_3px_0px_#000] min-w-[300px]">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5">
          <span className="text-white text-xs font-bold">{title}</span>
        </div>
        <div className="p-4 flex gap-3 items-start">
          <span className="text-2xl">{icon}</span>
          <p className="text-xs text-black mt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-4 pb-3">
          {onCancel && <RetroButton onClick={onCancel}>Cancel</RetroButton>}
          {onOk && <RetroButton onClick={onOk}>OK</RetroButton>}
        </div>
      </div>
    </div>
  );
}
