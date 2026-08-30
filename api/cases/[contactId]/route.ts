import { NextRequest, NextResponse } from "next/server";
import { mapGhlContactToRouterCase, routeDecision } from "@/lib/router-helpers";

// GHL contact IDs are opaque alphanumeric strings. Reject anything else before
// it reaches an upstream URL.
const CONTACT_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

async function getGhlContact(contactId: string) {
  const res = await fetch(
    `https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contactId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    // Log upstream detail server-side; never echo it to the caller.
    console.error(`GHL contact fetch failed: ${res.status}`);
    throw new Error("Failed to load case");
  }

  const data = await res.json();
  return data.contact || data.data?.contact || data.data || data;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ contactId: string }> }
) {
  // Server-to-server only (GHL workflow / Make scenario). Never called from a
  // browser, so a shared secret is the right gate.
  const expected = process.env.ROUTER_SHARED_SECRET;
  if (!expected || req.headers.get("x-router-secret") !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { contactId } = await context.params;

    if (!CONTACT_ID_RE.test(contactId)) {
      return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
    }

    const contact = await getGhlContact(contactId);
    const caseData = mapGhlContactToRouterCase(contact);
    const decision = routeDecision(caseData);

    return NextResponse.json(
      { success: true, case: caseData, decision },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error: any) {
    console.error("cases route error:", error?.message);
    return NextResponse.json({ error: "Failed to load case" }, { status: 500 });
  }
}
