// app/api/ghl-creditors/route.ts

export async function GET() {
  return Response.json({
    success: true,
    message: "ghl-creditors endpoint is live",
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  return Response.json({
    success: true,
    received: body,
  });
}
