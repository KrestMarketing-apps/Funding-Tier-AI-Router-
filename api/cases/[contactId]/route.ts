import { NextRequest, NextResponse } from "next/server";
import { mapGhlContactToRouterCase, routeDecision } from "@/lib/router-helpers";

async function getGhlContact(contactId: string) {
  const res = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-07-28",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load contact ${contactId}: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.contact || data.data?.contact || data.data || data;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ contactId: string }> }
) {
  try {
    const { contactId } = await context.params;
    const contact = await getGhlContact(contactId);
    const caseData = mapGhlContactToRouterCase(contact);
    const decision = routeDecision(caseData);

    return NextResponse.json({
      success: true,
      case: caseData,
      decision,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load case" },
      { status: 500 }
    );
  }
}
