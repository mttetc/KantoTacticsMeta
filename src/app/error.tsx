"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div style={{ padding: 16 }}>
      <div className="empty">
        The Meta could not be loaded{error.digest ? ` (ref. ${error.digest})` : ""}. The game&apos;s API may be unreachable right now.
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn gold" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
