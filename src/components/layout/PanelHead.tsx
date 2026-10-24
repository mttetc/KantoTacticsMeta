import type { ReactNode } from "react";
import { MetaIcon } from "./MetaIcon";
import s from "./layout.module.css";

/** The gold "Meta" header of the centre panel; each page gives its own subtitle. */
export function PanelHead({ title = "Meta", subtitle, children }: { title?: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <header className={s.panelHead}>
      <MetaIcon className={s.ico} />
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <div className={s.h1}>{title}</div>
        {subtitle && <small>{subtitle}</small>}
      </div>
      {children}
    </header>
  );
}

export function PanelBody({ children }: { children: ReactNode }) {
  return <div className={s.panelBody}>{children}</div>;
}
