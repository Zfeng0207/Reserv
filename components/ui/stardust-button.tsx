"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type StardustButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
}

export function StardustButton({
  children,
  className,
  disabled,
  ...props
}: StardustButtonProps) {
  return (
    <>
      <style>{`
        .btn {
          position: relative;
          left: -1rem;
          padding: 0.4rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #fff;
          background: none;
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s ease;
          min-width: 60px;
          z-index: 1;
          border-radius: 999px;
          font-family: "Inter", sans-serif;
        }
        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          filter: grayscale(0.3);
        }
        .neon-pulse {
          background: #000;
          border: 2px solid #0ff;
          box-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
          overflow: visible;
        }
        .neon-pulse::before,
        .neon-pulse::after {
          content: "";
          position: absolute;
          inset: -1.5px;
          border: 1px solid #0ff;
          border-radius: inherit;
          animation: pulseOut 2s ease-out infinite;
          opacity: 0;
          pointer-events: none;
        }
        .neon-pulse::after {
          animation-delay: 1s;
        }
        @keyframes pulseOut {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
      <button
        disabled={disabled}
        className={cn("btn neon-pulse", className)}
        {...props}
      >
        {children ?? "Create now"}
      </button>
    </>
  )
}

