"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = "[data-reveal]";

/**
 * Reveals each section only once after it reaches the viewport.
 *
 * Nothing is hidden in the server-rendered HTML: motion is enabled only after this
 * observer has marked the initially visible content as revealed. That keeps the
 * document usable without JavaScript, in unsupported browsers, and for reduced
 * motion preferences.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof window.IntersectionObserver === "undefined") return;

    const elements = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
    if (elements.length === 0) return;

    const inViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    };

    const visible = new Set(elements.filter(inViewport));
    const pending = elements.filter((element) => !visible.has(element));
    const bottomInset = Math.round(window.innerHeight * 0.08);

    let observer: IntersectionObserver | undefined;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.revealed = "true";
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: `0px 0px -${bottomInset}px 0px`, threshold: 0.08 },
      );

      pending.forEach((element) => observer?.observe(element));
    } catch (error) {
      observer?.disconnect();
      console.error("Scroll reveal initialization failed; content remains visible.", error);
      return;
    }

    // Enable hidden states only after the observer is ready to reveal every offscreen element.
    visible.forEach((element) => (element.dataset.revealed = "true"));
    document.documentElement.dataset.motionReady = "true";

    return () => {
      observer?.disconnect();
      delete document.documentElement.dataset.motionReady;
    };
  }, [pathname]);

  return null;
}
