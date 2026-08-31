import { list, del } from '@vercel/blob';

// Must match PLAN_TTL_DAYS in api/generate-plan.js. Plans stop rendering at
// this age (api/plan.js returns 410); this job reclaims the storage.
const PLAN_TTL_DAYS = 45;

export default async function handler(req, res) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
  // set. Without it this would be an open delete endpoint, so fail closed.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(404).json({ error: 'Not found' });
  }

  const cutoff = Date.now() - PLAN_TTL_DAYS * 86400000;
  let cursor;
  let scanned = 0;
  let deleted = 0;

  try {
    do {
      const page = await list({ prefix: 'plans/', cursor, limit: 1000 });
      scanned += page.blobs.length;

      const stale = page.blobs.filter(
        (b) => new Date(b.uploadedAt).getTime() < cutoff
      );
      if (stale.length) {
        await del(stale.map((b) => b.url));
        deleted += stale.length;
      }

      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    console.log(`cleanup-plans: scanned ${scanned}, deleted ${deleted}`);
    return res.status(200).json({ ok: true, scanned, deleted });
  } catch (error) {
    console.error('cleanup-plans failed:', error?.message);
    return res.status(500).json({ ok: false, error: 'Cleanup failed' });
  }
}
