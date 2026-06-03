"use client";

import { useState } from "react";
import { Phone, X, AlertTriangle, Info, XCircle } from "lucide-react";

interface Props {
  text: string;
  type: "warning" | "info" | "closed";
}

export default function EmergencyBanner({ text, type }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const styles = {
    warning: {
      wrapper: "bg-amber-50 border-b border-amber-200",
      icon: <AlertTriangle size={16} className="text-amber-600 shrink-0" />,
      text: "text-amber-800",
      close: "text-amber-600/60 hover:text-amber-600",
    },
    info: {
      wrapper: "bg-eritrea-blue/8 border-b border-eritrea-blue/20",
      icon: <Info size={16} className="text-eritrea-blue shrink-0" />,
      text: "text-eritrea-blue",
      close: "text-eritrea-blue/50 hover:text-eritrea-blue",
    },
    closed: {
      wrapper: "bg-eritrea-red/10 border-b border-eritrea-red/20",
      icon: <XCircle size={16} className="text-eritrea-red shrink-0" />,
      text: "text-eritrea-red",
      close: "text-eritrea-red/50 hover:text-eritrea-red",
    },
  }[type];

  return (
    <div className={styles.wrapper}>
      <div className="max-w-7xl mx-auto px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          {styles.icon}
          <span className={`${styles.text} font-medium`}>{text}</span>
          {type === "closed" && (
            <a
              href="tel:+31704276812"
              className={`flex items-center gap-1.5 ${styles.text} font-bold hover:underline ml-2`}
            >
              <Phone size={13} />
              +31 70 427 6812
            </a>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className={`${styles.close} transition-colors p-1`}
          aria-label="Sluiten"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
