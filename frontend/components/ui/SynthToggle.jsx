import React from "react";
import { cn } from "@/lib/utils";

export default function SynthToggle({
  checked,
  onCheckedChange,
  label,
  className = "",
  ...props
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <label
        htmlFor="synth-toggle"
        className="relative inline-flex items-center cursor-pointer"
      >
        <input
          type="checkbox"
          id="synth-toggle"
          className="sr-only peer"
          checked={checked}
          onChange={onCheckedChange}
          {...props}
        />
        <div
          className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-synth-primary dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-synth-primary"
        ></div>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    </div>
  );
} 