import { motion } from 'framer-motion';
import { RefObject } from 'react';
import useExternalClick from '@/hooks/useExternalClick';
import { Maybe } from '@/types';

interface DialogProps {
  readonly visible: boolean;
  readonly classname?: string;
  readonly onClose: () => void;
  readonly dialogRef: RefObject<Maybe<HTMLDivElement>>; // Update this line
  readonly children: React.ReactNode;
}

export default function Dialog(props: DialogProps): React.ReactElement {
  const { visible, classname, onClose, dialogRef, children } = props;

  useExternalClick(dialogRef, () => {
    onClose?.();
  });

  return (
    <>
      {visible && (
        <motion.div
          className={classname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}>
          {children}
        </motion.div>
      )}
    </>
  );
}