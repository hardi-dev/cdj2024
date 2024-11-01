// app/dashboard/admin/users/page.tsx
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateUserButton } from "@/components/admin/users/create-user-button";

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <CreateUserButton />
      </div>
      <UsersTable />
    </div>
  );
}
