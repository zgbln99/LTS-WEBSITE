import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Anmeldung" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="flex min-h-svh items-center justify-center bg-night-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 font-display text-sm font-extrabold">
            LTS
          </span>
          <span className="font-display text-xl font-bold">Logistik Admin</span>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h1 className="font-display text-xl font-bold text-night-900">
            Anmeldung
          </h1>
          <p className="mt-1 text-sm text-mist-500">
            Zugang nur für Mitarbeitende der LTS Logistik GmbH.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
