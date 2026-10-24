import s from "./layout.module.css";

/** Deterministic star field so the server and the client agree. */
function starField(n = 48) {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, (_, i) => ({
    key: i,
    style: { left: `${(rnd() * 100).toFixed(1)}%`, top: `${(rnd() * 100).toFixed(1)}%`, "--t": `${(2.2 + rnd() * 3).toFixed(1)}s`, "--d": `${(-rnd() * 5).toFixed(1)}s` } as React.CSSProperties,
  }));
}

export function Background() {
  return (
    <div className={s.bg} aria-hidden>
      <div className={s.rays} />
      <div className={s.stars}>
        {starField().map((st) => (
          <i key={st.key} style={st.style} />
        ))}
      </div>
      <div className={s.grid} />
      <div className={s.vignette} />
    </div>
  );
}
