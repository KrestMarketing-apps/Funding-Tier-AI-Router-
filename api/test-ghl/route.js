export async function GET() {
  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/locations/${process.env.GHL_LOCATION_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          Accept: "application/json"
        }
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
    return Response.json({
      ok: false,
      error: error.message
    });
  }
}
