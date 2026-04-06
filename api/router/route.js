function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req) {
  try {
    const body = await req.json();

    const contactId = body.contactId || null;
    const firstName = body.firstName || "";
    const lastName = body.lastName || "";
    const creditors = Array.isArray(body.creditors) ? body.creditors : [];

    if (!contactId) {
      return Response.json(
        { ok: false, error: "Missing contactId" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const slug = `${slugify(`${firstName} ${lastName} debt resolution plan`)}-${timestamp}`;
    const planId = slug;

    // Replace this later with your real persistence logic if needed.
    // For now, this returns the actual slug/url that the router will save back to GHL.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai.fundingtier.com";
    const planUrl = `${baseUrl}/plan/${slug}`;
    const pdfUrl = `${baseUrl}/api/generate-pdf?planId=${encodeURIComponent(planId)}`;
    const generatedAt = new Date().toISOString();

    return Response.json({
      ok: true,
      planId,
      slug,
      planUrl,
      pdfUrl,
      generatedAt,
      creditorCount: creditors.length
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
