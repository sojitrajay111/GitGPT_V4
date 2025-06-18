// src/components/synth/SynthProgress.jsx
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} SynthProgressProps
 * @property {number} [value]
 * @property {number} [max]
 * @property {string} [className]
 * @property {'sm' | 'md' | 'lg'} [size]
 */

/**
 * @param {SynthProgressProps & React.HTMLAttributes<HTMLDivElement>} props
 */
const SynthProgress = React.forwardRef(
  ({ value = 0, max = 100, className, size = "md" }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-2";
        case "md":
          return "h-3";
        case "lg":
          return "h-4";
        default:
          return "h-3";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-full bg-synth-surface overflow-hidden",
          "shadow-neumorphic-inset",
          getSizeClasses(),
          className
        )}
      >
        <motion.div
          className="h-full bg-synth-primary rounded-full shadow-neumorphic"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    );
  }
);
SynthProgress.displayName = "SynthProgress";

export default SynthProgress;
