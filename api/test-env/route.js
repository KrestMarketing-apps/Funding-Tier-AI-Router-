export async function GET() {
  return Response.json({
    ok: true,
    hasGhlApiKey: !!process.env.GHL_API_KEY,
    hasGhlLocationId: !!process.env.GHL_LOCATION_ID,
    hasRouterSecret: !!process.env.ROUTER_SHARED_SECRET,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null
  });
}
