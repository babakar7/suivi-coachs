import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
        Accès admin
      </h1>
      <LoginForm />
    </main>
  );
}
