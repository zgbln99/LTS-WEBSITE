import { requireRole } from "@/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

// DSGVO-Auskunft: alle zu einer Bewerbung gespeicherten Daten als JSON.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(["SUPER_ADMIN", "HR"]);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      files: true,
      notes: { include: { author: { select: { name: true, email: true } } } },
      activities: { orderBy: { createdAt: "asc" } },
      jobPosting: { select: { id: true, locationCity: true } }
    }
  });

  if (!application) return new Response("Not found", { status: 404 });

  const report = {
    auskunftErstelltAm: new Date().toISOString(),
    erstelltVon: session.user.email,
    bewerbung: {
      ...application,
      // S3-Schlüssel statt Binärdaten ausweisen
      files: application.files.map((file) => ({
        type: file.type,
        fileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        s3Key: file.s3Key,
        createdAt: file.createdAt
      }))
    }
  };

  const json = JSON.stringify(report, null, 2);
  return new Response(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dsgvo-auskunft-${id}.json"`
    }
  });
}
