async function updateGhlContact(contactId, fields = {}) {
  const payload = {};

  // Standard fields
  if (fields.firstName) payload.firstName = fields.firstName;
  if (fields.lastName) payload.lastName = fields.lastName;
  if (fields.email) payload.email = fields.email;
  if (fields.phone) payload.phone = fields.phone;

  // Custom fields
  if (fields.customFields && Array.isArray(fields.customFields)) {
    payload.customFields = fields.customFields;
  }

  const res = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contactId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const text = await res.text();

  return {
    ok: res.ok,
    status: res.status,
    text
  };
}

export async function POST(req) {
  try {
    // Optional shared-secret protection
    const headerSecret = req.headers.get("x-router-secret");
    if (
      process.env.ROUTER_SHARED_SECRET &&
      headerSecret !== process.env.ROUTER_SHARED_SECRET
    ) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const contactId = body.contactId || body.contact?.id || null;
    const firstName = body.firstName || body.contact?.firstName || "";
    const lastName = body.lastName || body.contact?.lastName || "";
    const email = body.email || body.contact?.email || "";
    const phone = body.phone || body.contact?.phone || "";

    if (!contactId) {
      return Response.json(
        { ok: false, error: "Missing contactId" },
        { status: 400 }
      );
    }

    // -----------------------------
    // TEMP LIVE TEST LOGIC ONLY
    // -----------------------------
    // This proves the webhook can hit Vercel
    // and Vercel can write back to the same GHL contact.
    const routerStatus = "Completed";
    const routerResult = "Live router test successful";
    const planUrl = `https://ai.fundingtier.com/plan/${contactId}`;
    const pdfUrl = `https://ai.fundingtier.com/api/generate-pdf?contactId=${contactId}`;

    const ghlUpdate = await updateGhlContact(contactId, {
      customFields: [
        {
          key: "router_status",
          field_value: routerStatus
        },
        {
          key: "router_result",
          field_value: routerResult
        },
        {
          key: "personalized_page_url",
          field_value: planUrl
        },
        {
          key: "pdf_url",
          field_value: pdfUrl
        }
      ]
    });

    return Response.json({
      ok: ghlUpdate.ok,
      status: ghlUpdate.status,
      message: "Router webhook processed",
      received: {
        contactId,
        firstName,
        lastName,
        email,
        phone
      },
      ghlResponse: ghlUpdate.text
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    message: "Router endpoint is live. Send POST requests from GHL."
  });
}
