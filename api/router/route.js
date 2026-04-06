async function updateGhlContact(contactId, fields = {}) {
  const payload = {};

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
    const headerSecret = req.headers.get("x-router-secret");

    if (
      process.env.ROUTER_SHARED_SECRET &&
      headerSecret !== process.env.ROUTER_SHARED_SECRET
    ) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const contactId = body.contactId || body.contact?.id;

    if (!contactId) {
      return Response.json({ ok: false, error: "Missing contactId" }, { status: 400 });
    }

    const ghlUpdate = await updateGhlContact(contactId, {
      customFields: [
        { key: "router_status", field_value: "Completed" },
        { key: "router_result", field_value: "Live router test successful" }
      ]
    });

    return Response.json({
      ok: ghlUpdate.ok,
      status: ghlUpdate.status,
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
