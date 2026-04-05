import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "ghl-creditors route is live",
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      ok: true,
      received: req.body,
    });
  }

  return res.status(405).json({ ok: false });
}
