"use client";

import { useState } from "react";
import { ui } from "@/components/ui/styles";

/** Copies the comp's team code (lib/team-code) so the board can be pasted into the game. */
export function TeamCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={ui.btn}
      title="Copy this board as a Kanto Tactics team code and paste it in the game"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          window.prompt("Team code", code);
        }
      }}
    >
      {copied ? "✓ Code copied" : "⎘ Copy team code"}
    </button>
  );
}
