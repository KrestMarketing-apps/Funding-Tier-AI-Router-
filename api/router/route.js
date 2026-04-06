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
    const body = await req.json();

    const contactId =
      body.contactId ||
      body.contact_id ||
      body.contact?.id ||
      null;

    const firstName =
      body.firstName ||
      body.first_name ||
      body.contact?.firstName ||
      "";

    const lastName =
      body.lastName ||
      body.last_name ||
      body.contact?.lastName ||
      "";

    const email =
      body.email ||
      body.contact?.email ||
      "";

    const phone =
      body.phone ||
      body.contact?.phone ||
      "";

    if (!contactId) {
      return Response.json(
        { ok: false, error: "Missing contactId", receivedBody: body },
        { status: 400 }
      );
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
