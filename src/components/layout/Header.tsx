import type { Role } from "@/lib/role";
import { NavLink } from "./NavLink";
import { NAV_LINKS } from "./navLinks";
import { RoleToggle } from "./RoleToggle";

export function Header({ role }: { role: Role }) {
  return (
    <header className="container">
      <nav className="site-nav" aria-label="Main">
        <ul>
          <li>
            <strong>AgentClinic</strong>
          </li>
        </ul>
        <ul>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <NavLink href={href}>{label}</NavLink>
            </li>
          ))}
        </ul>
        <ul>
          <RoleToggle role={role} />
        </ul>
      </nav>
    </header>
  );
}
