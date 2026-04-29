"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const tpRef = useRef<HTMLDivElement>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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
      {/* top-left logo */}
      <a href="#" className="logo" aria-label="EdgePad">
        <span className="logo-mark" />
        <span>EdgePad</span>
      </a>

      {/* giant background wordmark */}
      <div className="bg-wordmark" aria-hidden="true">
        EdgePad
      </div>

      {/* trackpad */}
      <div className="stage">
        <div className="trackpad-wrap" ref={tpRef}>
          <div className="trackpad">
            <div className="edge-frame">
              <div className="edge top" />
              <div className="edge right" />
              <div className="edge bot" />
              <div className="edge left" />
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
          Edge <em>More.</em>
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
            <a href="#" role="menuitem">
              <span className="os-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </span>
              Download for macOS
            </a>

            <a href="#" role="menuitem">
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
