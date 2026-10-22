
import { requireUser } from "@/lib/auth";
import WorkspaceShell from "@/components/layout/workspace-shell";

export default async function WorkspaceLayout({ children }) {
  const user = await requireUser();

  return (
    <WorkspaceShell user={user}>
      {children}
    </WorkspaceShell>
  );
}
