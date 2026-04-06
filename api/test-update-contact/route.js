export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");

  if (!contactId) {
    return Response.json(
      { ok: false, error: "Missing contactId" },
      { status: 400 }
    );
  }

  try {
    const updatePayload = {
      firstName: "Router Test",
      lastName: "Success"
    };

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
        body: JSON.stringify(updatePayload)
      }
    );

    const text = await res.text();

    return new Response(
      JSON.stringify(
        {
          ok: res.ok,
          status: res.status,
          response: text
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
