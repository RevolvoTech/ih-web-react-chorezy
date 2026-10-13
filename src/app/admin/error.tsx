"use client";
import { AdminButton, Notice } from "@/admin/ui";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <Notice error>
      <p>
        This section could not be displayed. No action has been retried
        automatically.
      </p>
      <AdminButton variant="secondary" onClick={reset}>
        Reload section
      </AdminButton>
    </Notice>
  );
}
