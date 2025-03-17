"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import useDimensions from "@/hooks/useDimensions";
import { Maybe } from "@/types";
import { ROUTES } from "@/config/route";
import { CaretDown } from "@/utils/icons";
import { UserCircle } from "lucide-react";
import styles from "@/styles/Navbar.module.scss";

const Dialog = dynamic(() => import("../Dialog"), { ssr: false });

export default function Profile(): React.ReactElement {
  const { isDesktop } = useDimensions(); // Check if it's a desktop screen
  const [visible, setVisible] = useState<boolean>(false);
  const profileRef = useRef<Maybe<HTMLDivElement>>(null);
  const router = useRouter();

  const onHover = () => {
    if (isDesktop) setVisible(true); // Show on hover only for desktop
  };

  const onClose = () => {
    if (isDesktop) setVisible(false); // Hide on hover out only for desktop
  };

  const onToggle = () => {
    if (!isDesktop) setVisible((prev) => !prev); // Toggle on click for mobile
  };

  const onSignout = async () => {
    await router.push(ROUTES.HOME);
  };

  return (
    <div
      className={styles.profile}
      onMouseEnter={onHover}
      onMouseLeave={onClose}
      onClick={onToggle} // Mobile/Tablet: Click to toggle
    >
      <UserCircle className={styles.user} size={32} />
      <motion.div animate={visible ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.25 }}>
        <CaretDown />
      </motion.div>
      {visible && (
        <Dialog dialogRef={profileRef} onClose={onClose} classname={styles.signout} visible={visible}>
          <div onClick={onSignout}>Sign out</div>
        </Dialog>
      )}
    </div>
  );
}
