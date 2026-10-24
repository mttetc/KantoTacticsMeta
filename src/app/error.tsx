"use client";

import { useEffect } from "react";
import { ui } from "@/components/ui/styles";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="p-4">
      <div className={ui.empty}>
        The Meta could not be loaded{error.digest ? ` (ref. ${error.digest})` : ""}. The game&apos;s API may be unreachable right now.
        <div className="mt-3">
          <button type="button" className={ui.btnGold} onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
