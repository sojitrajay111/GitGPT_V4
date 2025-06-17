// src/components/synth/SynthCard.jsx
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} SynthCardProps
 * @property {React.ReactNode} [children]
 * @property {'elevated' | 'inset' | 'flat'} [variant]
 * @property {'none' | 'sm' | 'md' | 'lg'} [padding]
 * @property {string} [className]
 */

/**
 * @param {SynthCardProps & Omit<React.HTMLMotionProps<'div'>, 'children'>} props
 */
const SynthCard = React.forwardRef(
  (
    { className, variant = "elevated", padding = "md", children, ...props },
    ref
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "elevated":
          return "shadow-neumorphic";
        case "inset":
          return "shadow-neumorphic-inset";
        case "flat":
          return "shadow-none border border-synth-text/10";
        default:
          return "shadow-neumorphic";
      }
    };

    const getPaddingClasses = () => {
      switch (padding) {
        case "none":
          return "";
        case "sm":
          return "p-3";
        case "md":
          return "p-6";
        case "lg":
          return "p-8";
        default:
          return "p-6";
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl bg-synth-surface transition-all duration-300",
          getVariantClasses(),
          getPaddingClasses(),
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SynthCard.displayName = "SynthCard";

export default SynthCard;
