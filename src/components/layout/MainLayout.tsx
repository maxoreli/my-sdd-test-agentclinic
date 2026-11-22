import { Header } from "./Header";
import { Main } from "./Main";
import { Footer } from "./Footer";
import "./layout.css";

// Header, Main, and Footer render as direct children of <body>, which is
// where PicoCSS applies its landmark spacing.
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
