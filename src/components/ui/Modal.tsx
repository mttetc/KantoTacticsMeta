"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./modal.module.css";

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
      className={s.veil}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="modal-title"
    >
      <div className={s.panel}>
        <header className={s.head}>
          <h2 id="modal-title">{title}</h2>
          <button type="button" className={s.x} onClick={close} aria-label="Close">
            ×
          </button>
        </header>
        <div className={s.body}>{children}</div>
      </div>
    </dialog>
  );
}
