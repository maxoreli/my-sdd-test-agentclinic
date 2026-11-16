import { Header } from "./Header";
import { Main } from "./Main";
import { Footer } from "./Footer";
import "./layout.css";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Header />
      <Main>{children}</Main>
      <Footer />
    </div>
  );
}
