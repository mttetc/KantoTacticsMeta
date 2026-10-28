"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function BackToTop() {
  const t = useTranslations("layout");
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("backToTop")}
      tabIndex={show ? 0 : -1}
      className={`fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-10 grid h-12 w-12 place-items-center rounded-[14px] border-[3px] border-[#0b0e18] bg-linear-to-b from-[#ffe066] via-[#fcc419] via-55% to-[#f08c00] text-[#1a1f2e] shadow-[0_4px_0_#0b0e18,0_10px_24px_#0006] transition-[opacity,transform] duration-200 ${show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
