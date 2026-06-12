import { redirect } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import { requireRole } from "@/auth";
import { prisma } from "@/server/db";
import { safeQuery } from "@/server/safe";
import {
  deleteServiceCity,
  saveServiceCity
} from "@/server/actions/content";
import { AdminCard, DbErrorBanner, EmptyState } from "@/components/admin/admin-ui";
import { Field, Input } from "@/components/ui/field";

export const dynamic = "force-dynamic";

export const metadata = { title: "Einsatzorte" };

export default async function ServiceCitiesAdminPage() {
  const session = await requireRole(["SUPER_ADMIN", "MARKETING", "EDITOR"]);
  if (!session) redirect("/admin");

  const cities = await safeQuery(() =>
    prisma.serviceCity.findMany({ orderBy: { order: "asc" } })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-night-900">
          Einsatzorte
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-mist-500">
          Städte, in denen LTS Logistik täglich im Einsatz ist. Sie erscheinen
          auf der Karte und in den Listen der Website. Koordinaten: in Google
          Maps mit Rechtsklick auf den Ort, erste Zahl ist die Breite (Lat),
          zweite die Länge (Lng).
        </p>
      </div>

      <AdminCard title="Neuen Einsatzort hinzufügen">
        <form action={saveServiceCity} className="grid gap-4 sm:grid-cols-5">
          <Field label="Stadt" htmlFor="city-name" required>
            <Input id="city-name" name="name" required minLength={2} />
          </Field>
          <Field label="Region" htmlFor="city-region">
            <Input id="city-region" name="region" placeholder="Brandenburg" />
          </Field>
          <Field label="Breite (Lat)" htmlFor="city-lat" required>
            <Input id="city-lat" name="lat" type="number" step="0.0001" required placeholder="52.52" />
          </Field>
          <Field label="Länge (Lng)" htmlFor="city-lng" required>
            <Input id="city-lng" name="lng" type="number" step="0.0001" required placeholder="13.405" />
          </Field>
          <Field label="Reihenfolge" htmlFor="city-order">
            <Input id="city-order" name="order" type="number" min={0} defaultValue={0} />
          </Field>
          <div className="sm:col-span-5">
            <button
              type="submit"
              className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Speichern
            </button>
          </div>
        </form>
      </AdminCard>

      {!cities ? (
        <DbErrorBanner />
      ) : cities.length === 0 ? (
        <EmptyState text="Noch keine Einsatzorte in der Datenbank. Die Website zeigt bis dahin die Standardliste." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3.5 font-semibold">Stadt</th>
                <th className="px-5 py-3.5 font-semibold">Region</th>
                <th className="px-5 py-3.5 font-semibold">Koordinaten</th>
                <th className="px-5 py-3.5 font-semibold">Reihenfolge</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {cities.map((city) => (
                <tr key={city.id} className="hover:bg-mist-50">
                  <td className="px-5 py-3 font-semibold text-night-900">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent-500" />
                      {city.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-mist-500">{city.region}</td>
                  <td className="px-5 py-3 text-mist-500">
                    {city.lat.toFixed(3)}, {city.lng.toFixed(3)}
                  </td>
                  <td className="px-5 py-3 text-mist-500">{city.order}</td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteServiceCity} className="inline">
                      <input type="hidden" name="id" value={city.id} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-mist-400 hover:bg-red-50 hover:text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
