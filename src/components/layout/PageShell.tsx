import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header, type NavKey } from "./Header";
import { SkipLink } from "./SkipLink";

/** Skip link, header, main landmark and footer. Every page renders inside this. */
export function PageShell({ current, children }: { current: NavKey; children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header current={current} />
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
