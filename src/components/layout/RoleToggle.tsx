import { switchRole } from "@/app/actions";
import { otherRole, type Role } from "@/lib/role";

/** Shows the current role and a button to switch to the other one. */
export function RoleToggle({ role }: { role: Role }) {
  const next = otherRole(role);
  return (
    <>
      <li>
        <small className="role-label">Viewing as {role}</small>
      </li>
      <li>
        <form action={switchRole}>
          <input type="hidden" name="role" value={next} />
          <button type="submit" className="secondary outline">
            Switch to {next} view
          </button>
        </form>
      </li>
    </>
  );
}
