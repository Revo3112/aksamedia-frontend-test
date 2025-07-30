import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "!inline-flex !items-center !justify-center !font-medium !rounded-lg !transition-all !duration-200 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 disabled:!opacity-50 disabled:!cursor-not-allowed !transform active:!scale-95 hover:!shadow-xl hover:!-translate-y-0.5 !cursor-pointer";

  const variants = {
    primary:
      "!bg-gradient-to-r !from-cyan-400 !to-blue-500 !text-white hover:!from-cyan-300 hover:!to-blue-400 focus:!ring-cyan-400 !shadow-lg hover:!shadow-xl hover:!shadow-cyan-500/25 dark:!from-cyan-400 dark:!to-blue-500 dark:hover:!from-cyan-300 dark:hover:!to-blue-400 !border !border-cyan-400 dark:!border-cyan-300 hover:!border-cyan-300 dark:hover:!border-cyan-200 !font-semibold",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-400 shadow-md hover:shadow-xl dark:from-gray-700 dark:to-gray-600 dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-gray-300 dark:border-gray-500",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-md hover:shadow-xl dark:from-red-400 dark:to-red-500 dark:hover:from-red-500 dark:hover:to-red-600 border border-red-600 dark:border-red-400",
    ghost:
      "text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:ring-gray-400 shadow-sm hover:shadow-md dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
