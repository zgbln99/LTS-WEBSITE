import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/routing";

// Invalidiert öffentliche Seiten in allen Sprachen sofort nach
// Admin-Änderungen. Der Cache ist nach den internen Routen
// (/{locale}/karriere usw.) aufgebaut, lokalisierte URLs werden per
// Middleware dorthin umgeschrieben.
export function revalidatePublic(internalPaths: string[]) {
  for (const path of internalPaths) {
    revalidatePath(`/[locale]${path}`, "page");
    for (const locale of locales) {
      revalidatePath(`/${locale}${path}`);
    }
  }
}
