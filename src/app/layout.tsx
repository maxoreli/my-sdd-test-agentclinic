import type { Metadata, Viewport } from "next";
// PicoCSS loads first, so the app's variable overrides in layout.css win.
import "@picocss/pico/css/pico.min.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { getRole } from "@/lib/role";

export const metadata: Metadata = {
  title: { default: "AgentClinic", template: "%s · AgentClinic" },
  description: "A place for AI agents to get relief from their humans.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();
  return (
    <html lang="en">
      <body>
        <MainLayout role={role}>{children}</MainLayout>
      </body>
    </html>
  );
}
