// src/components/synth/SynthInput.jsx
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} SynthInputProps
 * @property {string} [label]
 * @property {string} [error]
 * @property {React.ReactNode} [icon]
 * @property {boolean} [multiline] - If true, renders a textarea.
 * @property {number} [rows] - Number of rows for textarea.
 * @property {string} [type] - Input type (e.g., 'text', 'number', 'password').
 * @property {boolean} [select] - If true, renders a select-like input (requires children as options).
 * @property {Array<string | number>} [options] - Array of options for a 'select' type input.
 */

/**
 * @param {SynthInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'onDrag'>} props
 */
const SynthInput = React.forwardRef(
  (
    {
      className,
      type,
      label,
      error,
      icon,
      multiline,
      rows,
      select,
      options,
      children,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const renderInput = () => {
      if (multiline) {
        return (
          <motion.textarea
            className={cn(
              "flex min-h-[60px] w-full rounded-xl bg-synth-surface px-3 py-2 text-sm ring-offset-background placeholder:text-synth-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              "shadow-neumorphic-inset focus-visible:shadow-neumorphic-pressed",
              "focus-visible:ring-2 focus-visible:ring-synth-primary focus-visible:ring-offset-2",
              error && "ring-2 ring-red-500",
              className
            )}
            rows={rows || 4}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            animate={{
              scale: isFocused ? 1.005 : 1, // Slightly less scale for textarea
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            {...props}
          />
        );
      }

      if (select) {
        // This is a simplified select. For a true dropdown, you'd integrate a radix-ui select or similar.
        // For now, it mimics the appearance of SynthInput but with a native select's functionality.
        return (
          <div className="relative">
            <select
              className={cn(
                "flex h-12 w-full rounded-xl bg-synth-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-synth-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none pr-8", // pr-8 for dropdown arrow space
                "shadow-neumorphic-inset focus-visible:shadow-neumorphic-pressed",
                "focus-visible:ring-2 focus-visible:ring-synth-primary focus-visible:ring-offset-2",
                icon && "pl-10",
                error && "ring-2 ring-red-500",
                className
              )}
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            >
              {options
                ? options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))
                : children // Allow direct <option> children
              }
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-synth-text-muted pointer-events-none">
              {/* Custom dropdown arrow if needed, e.g., a ChevronDown icon */}
              &#9660; {/* Unicode for a simple down arrow */}
            </div>
          </div>
        );
      }

      return (
        <motion.input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl bg-synth-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-synth-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            "shadow-neumorphic-inset focus-visible:shadow-neumorphic-pressed",
            "focus-visible:ring-2 focus-visible:ring-synth-primary focus-visible:ring-offset-2",
            icon && "pl-10",
            error && "ring-2 ring-red-500",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          {...props}
        />
      );
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none text-synth-text">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-synth-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          {renderInput()}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
SynthInput.displayName = "SynthInput";

export default SynthInput;
