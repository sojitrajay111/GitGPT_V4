import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const SynthCard = React.forwardRef(
  ({ className, variant = "elevated", padding = "md", children, ...props }, ref) => {
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SynthCard.displayName = "SynthCard";

export { SynthCard }; 