interface RetroTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function RetroTextArea({ label, className = "", ...props }: RetroTextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-bold text-black">{label}</label>}
      <textarea
        className={`
          bg-white text-black text-xs p-1 resize-none
          border-2 border-[#808080] border-r-white border-b-white
          focus:outline-none
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
