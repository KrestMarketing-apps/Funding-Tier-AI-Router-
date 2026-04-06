export async function POST(req) {
  try {
    const body = await req.json();
    const { contactId } = body;

    if (!contactId) {
      return Response.json(
        { ok: false, error: "Missing contactId" },
        { status: 400 }
      );
    }

    const updatePayload = {
      customFields: [
        {
          key: "router_status",
          field_value: "Completed"
        },
        {
          key: "router_result",
          field_value: "Test result from Vercel"
        },
        {
          key: "pdf_url",
          field_value: "https://example.com/test.pdf"
        },
        {
          key: "personalized_page_url",
          field_value: "https://example.com/test-page"
        }
      ]
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
