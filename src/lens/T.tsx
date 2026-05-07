import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLensRegistry } from './useLensRegistry';

type Props = {
  en: ReactNode;
  ru: ReactNode;
  className?: string;
  block?: boolean;
};

/**
 * Bilingual text wrapper.
 *
 * The wrapper element is registered with `LensProvider`, which writes the
 * mouse position into `--tlens-x` / `--tlens-y` (in the wrapper's local
 * coordinate space). Both child layers inherit those custom properties:
 *
 *   - `.tlens__en` is masked OUT inside the lens circle (so the English
 *     disappears under the lens).
 *   - `.tlens__ru` is clipped TO the same circle and given a chromatic-
 *     aberration filter (so only Russian, with a glass-refraction look,
 *     appears inside the lens).
 *
 * This guarantees clean replacement instead of the two languages stacking.
 */
export function T({ en, ru, className, block }: Props) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const { register } = useLensRegistry();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    return register(el);
  }, [register]);

  return (
    <span
      ref={wrapperRef}
      className={`tlens${block ? ' tlens-block' : ''}${className ? ' ' + className : ''}`}
    >
      <span className="tlens__en">{en}</span>
      <span className="tlens__ru" aria-hidden="true">
        {ru}
      </span>
    </span>
  );
}
