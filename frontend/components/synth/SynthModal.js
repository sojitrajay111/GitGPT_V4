// src/components/synth/SynthModal.jsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import SynthButton from "./SynthButton"; // Make sure this path is correct

/**
 * @typedef {Object} SynthModalProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} [title]
 * @property {React.ReactNode} children
 * @property {string} [className]
 */

/**
 * @param {SynthModalProps} props
 */
const SynthModal = ({ isOpen, onClose, title, children, className }) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={cn(
              "fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50",
              "bg-synth-surface rounded-2xl shadow-neumorphic p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h2 className="text-lg font-semibold text-synth-text">
                  {title}
                </h2>
              )}
              <SynthButton
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </SynthButton>
            </div>

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SynthModal;
