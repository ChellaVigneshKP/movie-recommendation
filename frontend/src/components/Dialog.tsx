"use client";
import { AnimatePresence, motion } from "framer-motion";
import { RefObject } from "react";
import useExternalClick from "@/hooks/useExternalClick";
import { Maybe } from "@/types";

interface DialogProps {
  readonly visible: boolean;
  readonly classname?: string;
  readonly onClose: () => void;
  readonly dialogRef: RefObject<Maybe<HTMLDivElement>>;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}

export default function Dialog({ visible, classname, onClose, dialogRef, children, style }: DialogProps): React.ReactElement {
  useExternalClick(dialogRef, () => {
    if (visible) onClose();
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={classname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={style}
          ref={dialogRef as RefObject<HTMLDivElement>}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}