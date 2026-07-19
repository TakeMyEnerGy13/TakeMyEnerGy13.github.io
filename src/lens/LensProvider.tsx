import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LensContext, type LensRegistry } from './useLensRegistry';

type Props = {
  children: ReactNode;
};

/**
 * Provides a global mouse-tracked "liquid glass" lens cursor.
 * Tracks the mouse position and updates CSS variables on each registered
 * RU-text element so its `clip-path` reveals Russian content only inside
 * a circular area around the cursor.
 */
export function LensProvider({ children }: Props) {
  const elements = useRef(new Set<HTMLElement>());
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(true);
  const lensRef = useRef<HTMLDivElement | null>(null);

  // Detect fine pointer (desktop). Disable on touch / coarse input.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handle = () => setEnabled(mq.matches);
    handle();
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  // Add/remove a class to <body> so we can hide the native cursor only when
  // the lens is actually active.
  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('lens-active');
      return;
    }
    document.body.classList.add('lens-active');
    return () => document.body.classList.remove('lens-active');
  }, [enabled]);

  // Mouse tracking with rAF batching.
  useEffect(() => {
    if (!enabled) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let raf = 0;
    let dirty = false;

    const lensRadius =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--lens-radius'),
      ) || 118;

    const flush = () => {
      raf = 0;
      dirty = false;

      // Update cursor position via CSS variables on :root.
      document.documentElement.style.setProperty('--lens-mx', `${mx}px`);
      document.documentElement.style.setProperty('--lens-my', `${my}px`);

      elements.current.forEach((el) => {
        const rect = el.getBoundingClientRect();

        if (el.dataset.tlensSwap !== undefined) {
          // Swap mode: cross-fade the whole element once the lens circle
          // overlaps its rect. Hysteresis (enter deeper than exit) prevents
          // flicker while the lens hovers right at the boundary.
          const swapped = el.classList.contains('is-swapped');
          const threshold = swapped ? lensRadius + 30 : lensRadius - 25;
          const nx = Math.min(Math.max(mx, rect.left), rect.right);
          const ny = Math.min(Math.max(my, rect.top), rect.bottom);
          const dist = Math.hypot(mx - nx, my - ny);
          el.classList.toggle('is-swapped', dist < threshold);
          return;
        }

        // Mask mode: write the mouse position expressed in the element's
        // *own* local coordinate space so its clip mask follows the lens.
        const lx = mx - rect.left;
        const ly = my - rect.top;
        el.style.setProperty('--tlens-x', `${lx}px`);
        el.style.setProperty('--tlens-y', `${ly}px`);
      });
    };

    const schedule = () => {
      if (!dirty) {
        dirty = true;
        raf = requestAnimationFrame(flush);
      }
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setHidden(false);
      schedule();
    };
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);
    const onScroll = () => schedule();
    const onResize = () => schedule();

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Run once to position correctly on mount.
    schedule();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  const register = useCallback((el: HTMLElement) => {
    elements.current.add(el);
    return () => {
      elements.current.delete(el);
    };
  }, []);

  const value = useMemo<LensRegistry>(() => ({ register }), [register]);

  return (
    <LensContext.Provider value={value}>
      {/*
        SVG chromatic-aberration filter — splits text into RGB channels,
        offsets red right and blue left, recomposites with screen blending
        for a real-glass refraction look on the RU text inside the lens.
        Always rendered (even when lens is disabled) so SSR/static markup is
        consistent; the filter only applies via CSS `filter: url(#...)`.
      */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter
            id="tlens-chroma"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="
                1 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
              result="r"
            />
            <feOffset in="r" dx="1.1" dy="0.2" result="rOff" />

            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="
                0 0 0 0 0
                0 1 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
              result="g"
            />

            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="
                0 0 0 0 0
                0 0 0 0 0
                0 0 1 0 0
                0 0 0 1 0"
              result="b"
            />
            <feOffset in="b" dx="-1.1" dy="-0.2" result="bOff" />

            {/* Composite the channels with screen so overlapping areas
                go back to white but edges keep their chromatic fringe. */}
            <feBlend in="rOff" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="bOff" mode="screen" result="rgb" />
          </filter>
        </defs>
      </svg>

      {children}
      {enabled && (
        <div
          ref={lensRef}
          className={`lens-cursor${hidden ? ' is-hidden' : ''}`}
          aria-hidden="true"
        >
          <div className="lens-cursor__glass" />
          <div className="lens-cursor__rim" />
          <div className="lens-cursor__refraction" />
          <div className="lens-cursor__shine" />
          <div className="lens-cursor__glint" />
          <div className="lens-cursor__center" />
        </div>
      )}
    </LensContext.Provider>
  );
}
