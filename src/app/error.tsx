"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Shown when a page throws. Offers a retry and a way home. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("AgentClinic: page error:", error);
  }, [error]);

  return (
    <article>
      <hgroup>
        <h1>Something went wrong</h1>
        <p>The clinic hit an unexpected snag. Even clinics need a moment sometimes.</p>
      </hgroup>
      {error.digest && (
        <p>
          <small>Reference: {error.digest}</small>
        </p>
      )}
      <div className="grid">
        <button type="button" onClick={reset}>
          Try again
        </button>
        <Link href="/" role="button" className="secondary">
          Back to the dashboard
        </Link>
      </div>
    </article>
  );
}
