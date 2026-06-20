import { AppShell } from "@/components/AppShell";
import { TasksClient } from "@/components/tasks";

export default function TasksPage() {
  return (
    <AppShell>
      <TasksClient />
    </AppShell>
  );
}
