"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteSessionButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm("Delete this session? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete session");
      return;
    }

    toast.success("Session deleted");
    router.push("/sessions");
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete Session
    </Button>
  );
}
