import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <article>
      <hgroup>
        <h1>This page has wandered off</h1>
        <p>404: we checked every waiting room and couch, but it isn&apos;t here.</p>
      </hgroup>
      <p>It may have been a hallucination. It happens to the best of us.</p>
      <Link href="/" role="button">
        Back to the dashboard
      </Link>
    </article>
  );
}
