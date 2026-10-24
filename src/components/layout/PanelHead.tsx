import Link from "next/link";
import type { ReactNode } from "react";
import { ui } from "@/components/ui/styles";
import { MetaIcon } from "./MetaIcon";

/** The gold "Meta" header of the centre panel: optional back link on the left, title, actions on the right. */
export function PanelHead({ title = "Meta", subtitle, back, children }: { title?: ReactNode; subtitle?: ReactNode; back?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b-2 border-white/10 px-4 pt-3 pb-2.5 pl-[18px]">
      {back ? (
        <Link className={ui.back} href={back.href}>
          ‹ {back.label}
        </Link>
      ) : (
        <MetaIcon className="h-7 w-7 shrink-0 text-gold-hi drop-shadow-[0_2px_0_#000]" />
      )}
      <div className="min-w-0 flex-[1_1_220px]">
        <div className="m-0 text-[26px] leading-[1.1] font-bold text-gold [-webkit-text-stroke:1.2px_#0b0e18] [paint-order:stroke] [text-shadow:0_3px_0_#b8860b]">{title}</div>
        {subtitle && <small className="mt-0.5 block text-[13px] leading-[1.3] font-semibold text-[#adb5bd]">{subtitle}</small>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}

export function PanelBody({ children }: { children: ReactNode }) {
  return <div className="flex-1 px-3.5 pt-3 pb-4">{children}</div>;
}
