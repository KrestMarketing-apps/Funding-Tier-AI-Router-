import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import {
  buildSimplePdfBuffer,
  mapGhlContactToRouterCase,
  routeDecision,
} from "@/lib/router-helpers";

function toSafeString(value: unknown) {
  return String(value ?? "").trim();
}

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

async function getCustomFieldIdByName(locationId: string, fieldName: string) {
  const res = await fetch(
    `https://services.leadconnectorhq.com/locations/${locationId}/customFields`,
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
    const text = await res.text();
    throw new Error(`Failed to fetch custom fields: ${res.status} ${text}`);
  }

  const data = await res.json();
  const fields = Array.isArray(data?.customFields)
    ? data.customFields
    : Array.isArray(data?.fields)
    ? data.fields
    : Array.isArray(data)
    ? data
    : [];

  const match = fields.find((f: any) => {
    const candidates = [f?.id, f?.key, f?.fieldKey, f?.name, f?.fieldName]
      .filter(Boolean)
      .map((v: any) => String(v).trim().toLowerCase());

    return candidates.includes(fieldName.trim().toLowerCase());
  });

  if (!match) {
    throw new Error(`Custom field not found: ${fieldName}`);
  }

  return match.id;
}

async function updateContactPdfUrl(params: {
  contactId: string;
  customFieldId: string;
  pdfUrl: string;
}) {
  const res = await fetch(`https://services.leadconnectorhq.com/contacts/${params.contactId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      customFields: [
        {
          id: params.customFieldId,
          value: params.pdfUrl,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update contact PDF URL: ${res.status} ${text}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contactId = toSafeString(body.contactId);

    if (!contactId) {
      return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
    }

    const contact = await getGhlContact(contactId);
    const caseData = mapGhlContactToRouterCase(contact);
    const decision = routeDecision(caseData);
    const pdfBuffer = buildSimplePdfBuffer(caseData, decision);

    const blob = await put(
      `router-pdfs/${contactId}-${Date.now()}.pdf`,
      pdfBuffer,
      {
        access: "public",
        contentType: "application/pdf",
      }
    );

    const customFieldId = await getCustomFieldIdByName(
      process.env.GHL_LOCATION_ID!,
      "AI PROGRAM ESTIMATE-PDF URL"
    );

    await updateContactPdfUrl({
      contactId,
      customFieldId,
      pdfUrl: blob.url,
    });

    return NextResponse.json({
      success: true,
      pdfUrl: blob.url,
      decision,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
