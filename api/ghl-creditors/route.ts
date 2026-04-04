
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API is live" });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "POST received" });
}
