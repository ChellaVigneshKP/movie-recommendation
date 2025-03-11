"use client";

import Image from "next/image";
import styles from "@/styles/Loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.loadingOverlay}>
      <Image src="/logo.png" alt="Logo" width={150} height={150} priority/>
    </div>
  );
}
