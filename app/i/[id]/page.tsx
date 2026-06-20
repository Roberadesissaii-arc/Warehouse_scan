import { AppShell } from "@/components/AppShell";
import { ItemClient } from "@/components/item";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <ItemClient itemId={Number(id)} />
    </AppShell>
  );
}
