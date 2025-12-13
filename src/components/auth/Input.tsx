"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-lg
          bg-input-bg text-foreground
          border-2 border-border
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          transition-all duration-200
          placeholder:text-foreground/40
          ${error ? "border-error" : ""}
          ${className}
        `}
      />
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
