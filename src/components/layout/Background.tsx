/** The game's sky sparks: 14 four-point stars at the lobby's positions, twinkling in sequence (--i drives the delay). */
const SPARKS = [6, 43, 32, 21, 10, 47, 36, 25, 14, 51, 40, 29, 18, 7].map((top, i) => ({ i, left: 4 + i * 6.8, top }));

/** The game's title-screen background: sky gradient, spinning rays, scrolling perspective grid, sparks, vignette. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [background:linear-gradient(#2a2f7a_0%,#6b3fa0_38%,#f0727a_66%,#ffc46b_100%)]">
      <div className="absolute top-[42%] left-1/2 h-[136vmax] w-[136vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow [background:repeating-conic-gradient(#ffffff17_0deg,#ffffff17_7deg,transparent_7deg,transparent_18deg)] [mask-image:radial-gradient(93.3vmax,#000_0,transparent_100%)]" />
      <div className="absolute inset-x-0 top-0 bottom-[40%]">
        {SPARKS.map((p) => (
          <i
            key={p.i}
            className="absolute h-1.5 w-1.5 scale-200 animate-twinkle bg-[#fff7c2] shadow-[0_0_8px_#fff2a8] [clip-path:polygon(50%_0,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0_50%,38%_38%)]"
            style={{ "--i": p.i, left: `${p.left}%`, top: `${p.top}%` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="absolute -right-1/2 bottom-0 -left-1/2 h-[42%] origin-top overflow-hidden [mask-image:linear-gradient(transparent,#000_40%)] [transform:perspective(300px)_rotateX(58deg)] before:absolute before:inset-x-0 before:-top-16 before:bottom-0 before:animate-grid-scroll before:bg-[size:64px_64px] before:content-[''] before:[background-image:linear-gradient(#ffffff59_2px,transparent_2px),linear-gradient(90deg,#ffffff59_2px,transparent_2px)]" />
      <div className="absolute inset-0 [background:radial-gradient(transparent_45%,#0000008c)]" />
    </div>
  );
}
