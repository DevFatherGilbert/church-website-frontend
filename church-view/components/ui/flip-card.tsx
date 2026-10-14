"use client";

import { useRef } from "react";
import styles from "./flip-card.module.css";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  /** Height of the card. Defaults to "100%" */
  height?: string;
}

/**
 * 3D flip card — on hover the card rotates 180° on the Y-axis to reveal the back face.
 * Inspired by the TrusterLabs Core Security Services grid hover interaction.
 */
export function FlipCard({ front, back, className = "", height = "100%" }: FlipCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className={`${styles.scene} ${className}`}
      style={{ height }}
    >
      <div className={styles.card}>
        <div className={`${styles.face} ${styles.front}`}>{front}</div>
        <div className={`${styles.face} ${styles.back}`}>{back}</div>
      </div>
    </div>
  );
}
