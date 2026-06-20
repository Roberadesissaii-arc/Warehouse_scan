import { AppShell } from "@/components/AppShell";
import { TaskDetailClient } from "@/components/tasks";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <TaskDetailClient key={id} taskId={Number(id)} />
    </AppShell>
  );
}
