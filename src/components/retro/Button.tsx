interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function RetroButton({ children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        px-4 py-1 text-xs font-bold min-w-[75px]
        bg-[#c0c0c0] text-black
        border-2 border-white border-r-[#808080] border-b-[#808080]
        active:border-[#808080] active:border-r-white active:border-b-white
        active:translate-x-[1px] active:translate-y-[1px]
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:bg-[#d4d4d4]
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
