"use client";
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { Maybe } from '@/types';
import { ROUTES } from '@/config/route';
import { CaretDown } from '@/utils/icons';
import { UserCircle } from 'lucide-react';
import styles from '@/styles/Navbar.module.scss';

const Dialog = dynamic(() => import('../Dialog'), { ssr: false});

export default function Profile(): React.ReactElement {
  const [visible, setVisible] = useState<boolean>(false);
  const profileRef = useRef<Maybe<HTMLDivElement>>(null);
  const router = useRouter();
  const onHover = (): void => {
    setVisible(true);
  };

  const onClose = (): void => setVisible(false);

  const onSignout = (): Promise<boolean> => {
    return new Promise((resolve) => {
      router.push(ROUTES.HOME);
      resolve(true);
    });
  };

  const caretAnimation = {
    animate: visible ? 'up' : 'down',
    variants: {
      up: {
        rotate: 180
      },
      down: {
        rotate: 0
      }
    },
    transition: { duration: 0.25 }
  };

  return (
    <div className={styles.profile} onMouseOver={onHover}>
      <UserCircle className={styles.user} size={32} /> {/* Adjust size if needed */}
      <motion.div {...caretAnimation}>
        <CaretDown />
      </motion.div>
      <Dialog dialogRef={profileRef} onClose={onClose} classname={styles.signout} visible={visible}>
        <div onClick={onSignout}>Sign out</div>
      </Dialog>
    </div>
  );
}
