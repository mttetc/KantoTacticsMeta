"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ui } from "@/components/ui/styles";

/** Copies the comp's team code (lib/team-code) so the board can be pasted into the game. */
export function TeamCodeButton({ code }: { code: string }) {
  const t = useTranslations("teamCode");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={ui.btn}
      title={t("title")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          window.prompt(t("prompt"), code);
        }
      }}
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
