import { put } from '@vercel/blob';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

async function buildPlanPdfBuffer(pageUrl) {
  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });
    await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    return await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      scale: 0.82,
      margin: { top: '10px', bottom: '16px', left: '10px', right: '10px' }
    });
  } finally {
    await browser.close();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const {
      firstName = 'Client',
      lastName = '',
      email = '',
      state = '',
      totalDebt = 0,
      doNothing = {},
      shortest = {},
      recommended = {},
      route = '',
      routeReason = '',
      rows = []
    } = req.body || {};

    const fullName = `${firstName} ${lastName}`.trim();
    const safeName = slugify(fullName || 'client');
    const unique = Date.now();
    const slug = `${safeName}-debt-resolution-plan-${unique}`;
    const savings = Math.max(0, Number(doNothing.totalPayback || 0) - Number(recommended.totalCost || 0));

    const planData = {
      slug, firstName, lastName, fullName, email, state, totalDebt,
      doNothing, shortest, recommended, route, routeReason, rows, savings,
      createdAt: new Date().toISOString()
    };

    const dataBlob = await put(`plans/${slug}.json`, JSON.stringify(planData, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });

    const origin = getOrigin(req);
    const pageUrl = `${origin}/plan/${slug}`;

    const pdfBuffer = await buildPlanPdfBuffer(pageUrl);
    const pdfBlob = await put(`plans/${slug}.pdf`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    });

    return res.status(200).json({
      ok: true,
      slug,
      pageUrl,
      pdfUrl: pdfBlob.url,
      dataUrl: dataBlob.url,
      route
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Server error'
    });
  }
}
