"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The game's "meta veil": a native <dialog> over the current page. Used by the intercepted routes, so the
 * content is a Server Component passed as children, the URL is shareable, and Back closes it.
 */
export function Modal({ title, children }: { title: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [openedAt] = useState(path);
  const ref = useRef<HTMLDialogElement>(null);
  const active = path === openedAt;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (active && !d.open) d.showModal();
    if (!active && d.open) d.close();
  }, [active]);
  // Back (or any navigation away) leaves the slot's last content mounted until the router settles: hide it at once.
  if (!active) return null;
  const close = () => router.back();
  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="modal-title"
      className="m-0 h-full max-h-none w-full max-w-none place-items-center overflow-auto border-0 bg-transparent p-[max(10px,env(safe-area-inset-top))_max(10px,env(safe-area-inset-right))_max(10px,env(safe-area-inset-bottom))_max(10px,env(safe-area-inset-left))] font-ui text-[17px]/[1.35] text-txt open:grid backdrop:animate-meta-fade backdrop:bg-[#05070eb8] backdrop:backdrop-blur-[3px]"
    >
      <div className="max-h-full w-[min(820px,100%)] animate-modal-pop overflow-auto overscroll-contain rounded-[20px] border-4 border-paper bg-linear-to-b from-[#1b2030fa] to-[#10131efc] shadow-[inset_0_0_0_3px_var(--color-gold),inset_0_0_0_6px_#0b0e18,0_0_0_3px_#0b0e18,0_18px_60px_#0009]">
        <header className="sticky top-0 z-[1] flex items-center gap-2.5 border-b-2 border-white/10 bg-[#1b2030f5] px-3 pt-3 pb-2.5 pl-4">
          <h2 id="modal-title" className="m-0 flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[24px] leading-[1.1] font-bold text-gold [-webkit-text-stroke:1.2px_#0b0e18] [paint-order:stroke] [text-shadow:0_3px_#b8860b]">
            {title}
          </h2>
          <button type="button" onClick={close} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-white/30 bg-white/8 text-[22px] font-bold text-white shadow-[0_3px_#00000080] hover:bg-white/16">
            ×
          </button>
        </header>
        <div className="flex flex-col gap-3 px-3.5 pt-3 pb-4">{children}</div>
      </div>
    </dialog>
  );
}
