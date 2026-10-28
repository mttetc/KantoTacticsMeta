"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { ui } from "@/components/ui/styles";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="p-4">
      <div className={ui.empty}>
        {t("text", { ref: error.digest ?? "" })}
        <div className="mt-3">
          <button type="button" className={ui.btnGold} onClick={reset}>
            {t("retry")}
          </button>
        </div>
      </div>
    </div>
  );
}
