"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Maybe } from "@/types";
import { CaretDown } from "@/utils/icons";
import styles from "@/styles/Navbar.module.scss";
import useDimensions from "@/hooks/useDimensions";
import useExternalClick from "@/hooks/useExternalClick";

const Dialog = dynamic(() => import("../Dialog"), {
  ssr: false,
  loading: () => <div>Loading ...</div>,
});

const browseList = [
  { name: "Home", path: "/browse" },
  { name: "TV Shows", path: "/tv-shows" },
  { name: "Movies", path: "/movies" },
  { name: "New & Popular", path: "/new-popular" },
];

export default function Menu() {
  const { isMobile, isTablet } = useDimensions();
  const menuRef = useRef<Maybe<HTMLDivElement>>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onMenuToggle = (): void => {
    setIsVisible((prev) => !prev);
  };

  const onClose = (): void => {
    setIsVisible(false);
  };

  // ✅ Attach external click handler to close menu
  useExternalClick(menuRef, onClose);

  const caretAnimation = {
    animate: isVisible ? "up" : "down",
    variants: {
      up: { rotate: 180 },
      down: { rotate: 0 },
    },
    transition: { duration: 0.25 },
  };

  return (
    <>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className={styles.nfLogo}
        />
      </Link>

      {(isTablet || isMobile) ? (
        <>
          <div className={styles.browse} onClick={onMenuToggle}>
            <div className={styles.options}>Browse</div>
            <motion.div {...caretAnimation}>
              <CaretDown />
            </motion.div>
          </div>

          {isVisible && (
            <div ref={menuRef}> {/* ✅ Attach ref for external click detection */}
              <Dialog
                dialogRef={menuRef}
                onClose={onClose}
                classname={styles.menu}
                visible={isVisible}
                style={{ zIndex: 1001 }}
              >
                {browseList.map((item, index) => (
                  <Link key={index} href={item.path}>
                    <div className={styles.options}>{item.name}</div>
                  </Link>
                ))}
              </Dialog>
            </div>
          )}
        </>
      ) : (
        browseList.map((item, index) => (
          <Link key={index} href={item.path}>
            <div className={styles.options}>{item.name}</div>
          </Link>
        ))
      )}
    </>
  );
}