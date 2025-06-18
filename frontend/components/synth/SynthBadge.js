// src/components/synth/SynthBadge.jsx
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} SynthBadgeProps
 * @property {React.ReactNode} [children]
 * @property {'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'quality'} [variant]
 * @property {string} [className]
 */

const synthBadgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-synth-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-synth-surface text-synth-text shadow-neumorphic-inset",
        primary: "bg-synth-primary text-white shadow-neumorphic",
        secondary: "bg-synth-secondary text-white shadow-neumorphic",
        success: "bg-green-500 text-white shadow-neumorphic",
        warning: "bg-yellow-500 text-white shadow-neumorphic",
        error: "bg-red-500 text-white shadow-neumorphic",
        quality: {
          A: "bg-green-500 text-white shadow-neumorphic",
          B: "bg-blue-500 text-white shadow-neumorphic",
          C: "bg-yellow-500 text-white shadow-neumorphic",
          D: "bg-orange-500 text-white shadow-neumorphic",
          E: "bg-red-500 text-white shadow-neumorphic",
        },
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * @param {SynthBadgeProps & React.HTMLAttributes<HTMLDivElement>} props
 */
const SynthBadge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      className={cn(synthBadgeVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  );
});
SynthBadge.displayName = "SynthBadge";

export default SynthBadge;
