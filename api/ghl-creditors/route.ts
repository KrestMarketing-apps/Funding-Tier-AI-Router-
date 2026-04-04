import { NextRequest, NextResponse } from "next/server";

function toSafeString(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET() {
  return NextResponse.json({ message: "ghl-creditors route is live" });
}

export async function POST(req: NextRequest) {
  try {
    const incomingSecret = req.headers.get("x-router-secret");
    if (incomingSecret !== process.env.ROUTER_SHARED_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const contactId = toSafeString(payload.contact_id);

    if (!contactId) {
      return NextResponse.json({ error: "Missing contact_id" }, { status: 400 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    const routerUrl = `${appUrl}?contactId=${encodeURIComponent(contactId)}`;

    return NextResponse.json({
      success: true,
      contactId,
      routerUrl,
      message: "Payload received.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}
