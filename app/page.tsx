"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import edgepadLogo from "../public/edgepad.png";

export default function Home() {
  const tpRef = useRef<HTMLDivElement>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const fingerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const installCmd =
    "curl -fsSL https://raw.githubusercontent.com/forkiron/EdgePad/main/install.sh | bash";

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(installCmd);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = installCmd;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  // measured trackpad dimensions (post-rotation projected) — defaults match desktop
  const [dims, setDims] = useState({ w: 900, h: 376 });

  // measure trackpad before paint so particles target the right shape
  useLayoutEffect(() => {
    const measure = () => {
      if (!tpRef.current) return;
      const r = tpRef.current.getBoundingClientRect();
      // r.width = trackpad-wrap width (rotation around X preserves X)
      // we want UNROTATED dimensions because .pixel-cloud applies the same rotateX(48deg).
      // Trackpad aspect-ratio is 1.6:1, so unrotated height = width / 1.6.
      const w = r.width;
      const h = w / 1.6;
      setDims({
        w: w * 0.96,
        h: h * 0.96,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // gentle parallax tilt on the trackpad
  useEffect(() => {
    let raf: number | null = null;
    const baseX = 48;
    let tx = baseX;
    let tz = 0;

    function onMove(e: MouseEvent) {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      tx = baseX - py * 7;
      tz = -px * 5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (tpRef.current) {
          tpRef.current.style.transform = `rotateX(${tx}deg) rotateZ(${tz}deg)`;
        }
        raf = null;
      });
    }

    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // finger cursor — follows mouse when over trackpad, hidden otherwise
  useEffect(() => {
    let raf: number | null = null;
    let lx = 0;
    let ly = 0;

    function onMove(e: MouseEvent) {
      lx = e.clientX;
      ly = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (!tpRef.current || !fingerRef.current) {
          raf = null;
          return;
        }
        const r = tpRef.current.getBoundingClientRect();
        const onTp =
          lx >= r.left &&
          lx <= r.right &&
          ly >= r.top &&
          ly <= r.bottom;

        const f = fingerRef.current;
        if (onTp) {
          f.style.opacity = "1";
          // center aura ball on the cursor
          f.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`;
        } else {
          f.style.opacity = "0";
        }
        raf = null;
      });
    }

    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // close drop-up on outside click / esc
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <main>
      {/* aura ball cursor — appears only when hovering the trackpad */}
      <div ref={fingerRef} className="aura-cursor" aria-hidden="true">
        <span className="aura-halo" />
        <span className="aura-core" />
      </div>

      {/* top-left logo */}
      <a href="#" className="logo" aria-label="edgepad">
        <Image src={edgepadLogo} alt="" className="logo-img" priority />
        <span className="logo-text">edgepad</span>
      </a>

      {/* trackpad */}
      <div className="stage">
        {/* pixel cloud: 3D sphere → flat trackpad-shaped grid → fade */}
        <div className="pixel-cloud" aria-hidden="true">
          {(() => {
            const N = 420;
            const sphereR = 105;
            const gridW = dims.w;
            const gridH = dims.h;

            // deterministic pseudo-random based on index — SSR-safe
            const rand = (seed: number) => {
              const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
              return x - Math.floor(x);
            };

            const items = [];
            for (let i = 0; i < N; i++) {
              // random point uniformly inside a sphere (filled blob)
              const u = rand(i * 3 + 1);
              const v = rand(i * 3 + 2);
              const w = rand(i * 3 + 3);
              const theta = u * Math.PI * 2;
              const phi = Math.acos(2 * v - 1);
              const radius = Math.cbrt(w) * sphereR;
              const cx = Math.round(radius * Math.sin(phi) * Math.cos(theta));
              const cy = Math.round(radius * Math.sin(phi) * Math.sin(theta));
              const cz = Math.round(radius * Math.cos(phi));

              // random point inside trackpad rectangle
              const gx = Math.round((rand(i * 5 + 11) - 0.5) * gridW);
              const gy = Math.round((rand(i * 5 + 13) - 0.5) * gridH);

              const delay = +(rand(i * 7 + 17) * 0.3).toFixed(3);
              items.push({ i, cx, cy, cz, gx, gy, delay });
            }
            return items.map(({ i, cx, cy, cz, gx, gy, delay }) => (
              <span
                key={i}
                className="pixel"
                style={
                  {
                    "--cx": `${cx}px`,
                    "--cy": `${cy}px`,
                    "--cz": `${cz}px`,
                    "--gx": `${gx}px`,
                    "--gy": `${gy}px`,
                    "--d": `${delay}s`,
                  } as React.CSSProperties
                }
              />
            ));
          })()}
        </div>

        <div className="trackpad-wrap" ref={tpRef}>
          <div className="trackpad">
            <div className="edge-frame">
              <div className="edge top" />
              <div className="edge right" />
              <div className="edge bot" />
              <div className="edge left" />
              <span className="neon-lap-line" aria-hidden="true" />
              <div className="corner tl" />
              <div className="corner tr" />
              <div className="corner br" />
              <div className="corner bl" />
            </div>
          </div>
        </div>

      </div>

      {/* tagline + drop-up download */}
      <div className="hero-bottom">
        <h1 className="tagline">
          Use Your <em>Edge.</em>
        </h1>

        <div
          className={`download${open ? " open" : ""}`}
          ref={dlRef}
        >
          <button
            className="btn-primary"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            Download
            <svg
              className="chevron"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 7.5l3.5-3 3.5 3" />
            </svg>
          </button>

          <div className="download-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className={`menu-item install-curl${copied ? " copied" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                copyInstall();
              }}
            >
              <span className="os-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </span>
              <span className="install-text">
                <span className="install-label">macOS — copy install command</span>
                <code className="install-cmd">{installCmd}</code>
              </span>
              <span className="copy-ind" aria-hidden="true">
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </svg>
                )}
              </span>
              <span className={`copied-toast${copied ? " show" : ""}`} aria-live="polite">
                Copied
              </span>
            </button>

            <a href="/download/windows" role="menuitem" download>
              <span className="os-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 5.5L10.5 4.5v7H3V5.5zm0 13l7.5 1v-7H3v6zM11.5 4.4L21 3v8.5h-9.5V4.4zm0 15.2l9.5 1.4v-8.5h-9.5v7.1z" />
                </svg>
              </span>
              Download for Windows
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
