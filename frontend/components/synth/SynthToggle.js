// src/components/synth/SynthToggle.jsx
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} SynthToggleProps
 * @property {boolean} [checked]
 * @property {(checked: boolean) => void} [onCheckedChange]
 * @property {boolean} [disabled]
 * @property {string} [label]
 * @property {string} [description]
 * @property {string} [className]
 */

/**
 * @param {SynthToggleProps & React.HTMLAttributes<HTMLButtonElement>} props
 */
const SynthToggle = React.forwardRef(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      label,
      description,
      className,
    },
    ref
  ) => {
    const handleToggle = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex flex-col space-y-1">
          {label && (
            <label className="text-sm font-medium leading-none text-synth-text cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-synth-text-muted">{description}</p>
          )}
        </div>

        <motion.button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synth-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked
              ? "bg-synth-primary shadow-neumorphic-inset" // Note: Sir's design shows inset for checked state
              : "bg-synth-surface shadow-neumorphic"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200",
              checked ? "shadow-neumorphic" : "shadow-neumorphic-inset" // Note: Sir's design shows inset for unchecked knob
            )}
            animate={{
              x: checked ? 24 : 4,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>
    );
  }
);
SynthToggle.displayName = "SynthToggle";

export default SynthToggle;
