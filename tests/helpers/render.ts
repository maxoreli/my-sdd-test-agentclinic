import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Render to static markup, minus the form-replay <script> React appends when
 * the markup contains a form with a Server Action.
 */
export function renderHtml(element: ReactElement): string {
  return renderToStaticMarkup(element).replace(/<script>addEventListener\("submit"[\s\S]*?<\/script>/, "");
}
