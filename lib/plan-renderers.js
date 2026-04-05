const FUNDING_TIER_LOGO =
  'https://assets.cdn.filesafe.space/S4ztIlDxBovAboldwbOR/media/68783cf8e8df54a8b29097c4.png';

const BRAND = {
  name: 'Funding Tier',
  phone: '(833) 716-3863',
  phoneHref: 'tel:8337163863',
  website: 'https://fundingtier.com',
  primary: '#009688',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  accent: '#14b8a6',
  red: '#dc2626',
  text: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0',
  softBg: '#f8fafc',
  successBg: '#ecfdf5',
  dangerBg: '#fef2f2'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function fullName(firstName = '', lastName = '') {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'Client';
}

function buildPlanSlug(firstName = '', lastName = '', planId = '') {
  const readable = slugify(fullName(firstName, lastName));
  return `${readable || 'client'}-${planId}`.replace(/-+/g, '-');
}

function normalizeBaseUrl(baseUrl = '') {
  return String(baseUrl || '').replace(/\/+$/, '');
}

function buildPlanUrls({ baseUrl, firstName, lastName, planId }) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const slug = buildPlanSlug(firstName, lastName, planId);

  return {
    slug,
    pageUrl: `${normalizedBaseUrl}/plan/${slug}`,
    pdfUrl: `${normalizedBaseUrl}/plan/${slug}/pdf`
  };
}

function comparisonRows(plan) {
  const doNothing = plan?.doNothing || {};
  const shortest = plan?.shortest || {};
  const recommended = plan?.recommended || {};

  const shortestSavings = Math.max(
    0,
    (Number(doNothing.totalPayback) || 0) - (Number(shortest.totalCost) || 0)
  );

  const recommendedSavings = Math.max(
    0,
    (Number(doNothing.totalPayback) || 0) - (Number(recommended.totalCost) || 0)
  );

  return [
    {
      label: 'Monthly Payments',
      current: currency(doNothing.monthlyPayment || 0),
      fastest: shortest.term ? currency(shortest.monthlyPayment || 0) : '—',
      recommended: recommended.term ? currency(recommended.monthlyPayment || 0) : '—'
    },
    {
      label: 'Total Estimated Debt',
      current: currency(plan.totalDebt || 0),
      fastest: shortest.term ? currency(plan.totalDebt || 0) : '—',
      recommended: recommended.term ? currency(plan.totalDebt || 0) : '—'
    },
    {
      label: 'Months to Payoff',
      current: doNothing.monthsToPayoff ? `${doNothing.monthsToPayoff} months` : '—',
      fastest: shortest.term ? `${shortest.term} months` : '—',
      recommended: recommended.term ? `${recommended.term} months` : '—'
    },
    {
      label: 'Estimated Int Rate',
      current: doNothing.apr ? `${Math.round(doNothing.apr * 100)}% APR` : '—',
      fastest: shortest.term ? '0%' : '—',
      recommended: recommended.term ? '0%' : '—'
    },
    {
      label: 'Estimated Total Payback',
      current: currency(doNothing.totalPayback || 0),
      fastest: shortest.term ? currency(shortest.totalCost || 0) : '—',
      recommended: recommended.term ? currency(recommended.totalCost || 0) : '—'
    },
    {
      label: 'Estimated Savings',
      current: '—',
      fastest: shortest.term ? currency(shortestSavings) : '—',
      recommended: recommended.term ? currency(recommendedSavings) : '—'
    }
  ];
}

function renderDebtItems(rows = []) {
  if (!Array.isArray(rows) || !rows.length) {
    return `
      <div style="border:1px solid ${BRAND.border}; border-radius:16px; padding:16px; background:#fff;">
        No debt items were available for this estimate.
      </div>
    `;
  }

  return rows
    .map((row) => {
      const creditor =
        row?.creditorName === 'Other / Manual Entry'
          ? row?.manualName || 'Manual Creditor'
          : row?.creditorName || 'Unknown Creditor';

      return `
        <div style="border:1px solid ${BRAND.border}; border-radius:16px; padding:16px; background:#fff; margin-top:12px;">
          <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:space-between;">
            <div style="font-weight:700; color:${BRAND.text};">${escapeHtml(creditor)}</div>
            <div style="font-weight:700; color:${BRAND.text};">${currency(row?.amount || 0)}</div>
          </div>
          <div style="margin-top:6px; color:${BRAND.muted}; font-size:14px;">
            ${escapeHtml(row?.debtType || '—')}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderComparisonTable(plan, options = {}) {
  const rows = comparisonRows(plan);
  const compact = !!options.compact;

  return `
    <table style="width:100%; border-collapse:collapse; min-width:${compact ? '100%' : '900px'};">
      <thead>
        <tr>
          <th style="padding:14px; border:1px solid ${BRAND.border}; background:#f8fafc; text-align:left; font-size:13px; color:#334155;">Detail</th>
          <th style="padding:14px; border:1px solid ${BRAND.border}; background:#fef2f2; text-align:left; font-size:13px; color:#334155;">Current Financial Situation</th>
          <th style="padding:14px; border:1px solid ${BRAND.border}; background:#ffffff; text-align:left; font-size:13px; color:#334155;">Fastest Available Payoff</th>
          <th style="padding:14px; border:1px solid ${BRAND.border}; background:#ecfdf5; text-align:left; font-size:13px; color:#334155;">Recommended Program</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row, idx) => {
            const isSavings = idx === 5;
            return `
              <tr style="${isSavings ? `background:${BRAND.primary}; color:#fff;` : ''}">
                <td style="padding:14px; border:1px solid ${BRAND.border}; font-weight:600;">${escapeHtml(row.label)}</td>
                <td style="padding:14px; border:1px solid ${BRAND.border}; ${
                  idx === 4 && !isSavings ? `color:${BRAND.red}; font-weight:800;` : ''
                }">${escapeHtml(row.current)}</td>
                <td style="padding:14px; border:1px solid ${BRAND.border};">${escapeHtml(row.fastest)}</td>
                <td style="padding:14px; border:1px solid ${BRAND.border}; font-weight:700;">${escapeHtml(row.recommended)}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function renderHeaderBlock(title, subtitle = '') {
  return `
    <div style="display:flex; align-items:center; gap:18px; margin-bottom:24px;">
      <img src="${FUNDING_TIER_LOGO}" alt="Funding Tier Logo" style="width:150px; height:auto; display:block;" />
      <div>
        <div style="font-size:28px; line-height:1.1; font-weight:800; color:${BRAND.text};">${escapeHtml(title)}</div>
        ${
          subtitle
            ? `<div style="margin-top:6px; color:${BRAND.muted}; font-size:15px; line-height:1.6;">${escapeHtml(subtitle)}</div>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderPlanPageHtml(plan) {
  const name = fullName(plan.firstName, plan.lastName);
  const savings = Math.max(
    0,
    (Number(plan?.doNothing?.totalPayback) || 0) - (Number(plan?.recommended?.totalCost) || 0)
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(name)} - Debt Resolution Plan</title>
</head>
<body style="margin:0; font-family:Arial, Helvetica, sans-serif; background:linear-gradient(180deg, #ecfeff 0%, #ffffff 35%, #f8fafc 100%); color:${BRAND.text};">
  <div style="max-width:1180px; margin:0 auto; padding:24px;">
    <section style="border-radius:28px; background:linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 35%, ${BRAND.accent} 100%); color:#fff; padding:42px 34px; box-shadow:0 20px 50px rgba(15,118,110,0.22);">
      <div style="display:flex; justify-content:space-between; gap:24px; flex-wrap:wrap; align-items:flex-start;">
        <div style="flex:1 1 620px; min-width:280px;">
          <img src="${FUNDING_TIER_LOGO}" alt="Funding Tier Logo" style="width:160px; height:auto; display:block; margin-bottom:18px;" />
          <div style="display:inline-block; padding:8px 14px; border-radius:999px; background:rgba(255,255,255,0.14); font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;">
            Funding Tier Personalized Plan
          </div>
          <h1 style="margin:18px 0 10px; font-size:42px; line-height:1.05; letter-spacing:-0.03em;">${escapeHtml(plan.firstName || 'Client')}, here’s your debt resolution comparison</h1>
          <p style="margin:0; font-size:17px; line-height:1.7; color:rgba(255,255,255,0.94);">
            This page shows the difference between continuing your current financial path versus moving into a structured debt resolution program based on the current scenario inputs.
          </p>
        </div>
        <div style="flex:1 1 300px; min-width:260px; border-radius:22px; background:rgba(255,255,255,0.13); border:1px solid rgba(255,255,255,0.14); padding:22px;">
          <div style="font-size:12px; text-transform:uppercase; letter-spacing:.08em; opacity:0.9;">Estimated Savings vs Current Path</div>
          <div style="margin-top:8px; font-size:34px; font-weight:800;">${currency(savings)}</div>
          <div style="margin-top:14px; font-size:14px; line-height:1.7;">
            Recommended route: <strong>${escapeHtml(plan.route || 'N/A')}</strong><br/>
            State: <strong>${escapeHtml(plan.state || 'N/A')}</strong><br/>
            Total debt reviewed: <strong>${currency(plan.totalDebt || 0)}</strong>
          </div>
        </div>
      </div>
    </section>

    <section style="margin-top:28px; border-radius:24px; background:#fff; padding:28px; box-shadow:0 12px 36px rgba(15,23,42,0.07);">
      <h2 style="margin:0 0 10px; font-size:28px; letter-spacing:-0.02em;">Your Estimated Snapshot</h2>
      <p style="margin:0; color:${BRAND.muted}; line-height:1.7;">
        The numbers below are meant to show why staying on the current path can become more expensive over time, and how a structured program may create a more manageable outcome.
      </p>

      <div style="margin-top:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:18px;">
        <div style="border-radius:20px; background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border:1px solid ${BRAND.border}; padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#64748b;">Total Debt Reviewed</div>
          <div style="margin-top:8px; font-size:28px; font-weight:800;">${currency(plan.totalDebt || 0)}</div>
        </div>
        <div style="border-radius:20px; background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border:1px solid ${BRAND.border}; padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#64748b;">Current Monthly Path</div>
          <div style="margin-top:8px; font-size:28px; font-weight:800;">${currency(plan?.doNothing?.monthlyPayment || 0)}</div>
        </div>
        <div style="border-radius:20px; background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border:1px solid ${BRAND.border}; padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#64748b;">Recommended Monthly</div>
          <div style="margin-top:8px; font-size:28px; font-weight:800;">${currency(plan?.recommended?.monthlyPayment || 0)}</div>
        </div>
        <div style="border-radius:20px; background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border:1px solid ${BRAND.border}; padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#64748b;">Recommended Term</div>
          <div style="margin-top:8px; font-size:28px; font-weight:800;">${plan?.recommended?.term ? `${escapeHtml(String(plan.recommended.term))} mo` : '—'}</div>
        </div>
      </div>

      <div style="margin-top:24px; overflow-x:auto; border-radius:20px; border:1px solid ${BRAND.border};">
        ${renderComparisonTable(plan)}
      </div>

      <div style="margin-top:18px; font-size:13px; line-height:1.7; color:#64748b;">
        <strong>Why this matters:</strong> continuing to make minimum payments can stretch debt out for a long time and materially increase total payback. A structured program may provide a more controlled path with a lower total burden compared with the current financial situation.
      </div>
    </section>

    <section style="margin-top:28px; border-radius:24px; background:#fff; padding:28px; box-shadow:0 12px 36px rgba(15,23,42,0.07);">
      <h2 style="margin:0 0 10px; font-size:28px; letter-spacing:-0.02em;">Accounts Reviewed</h2>
      <p style="margin:0; color:${BRAND.muted}; line-height:1.7;">
        Below is the debt mix used to create this estimate.
      </p>

      <div style="margin-top:22px;">
        ${renderDebtItems(plan.rows || [])}
      </div>

      ${
        plan.routeReason
          ? `<div style="margin-top:18px; font-size:14px; line-height:1.7; color:${BRAND.muted};">${escapeHtml(plan.routeReason)}</div>`
          : ''
      }
    </section>

    <section style="margin-top:28px; border-radius:24px; background:#fff; padding:28px; box-shadow:0 12px 36px rgba(15,23,42,0.07);">
      <h2 style="margin:0 0 10px; font-size:28px; letter-spacing:-0.02em;">Next Step</h2>
      <p style="margin:0; color:${BRAND.muted}; line-height:1.7;">
        If this estimated path makes sense to you, the next step is to complete your review with Funding Tier so your final program structure can be confirmed.
      </p>

      <div style="margin-top:24px; display:flex; gap:14px; flex-wrap:wrap;">
        <a href="https://krestmarketing.com/start-winning/" style="display:inline-block; padding:14px 22px; border-radius:14px; text-decoration:none; font-weight:700; background:linear-gradient(90deg, ${BRAND.primaryDark}, ${BRAND.accent}); color:#fff;">
          Complete Your Next Step
        </a>
        <a href="${escapeHtml(plan.pdfUrl || '#')}" style="display:inline-block; padding:14px 22px; border-radius:14px; text-decoration:none; font-weight:700; background:#fff; color:${BRAND.primaryDark}; border:1px solid #99f6e4;">
          Download PDF Summary
        </a>
      </div>

      <div style="margin-top:18px; font-size:13px; line-height:1.7; color:#64748b;">
        These estimates are illustrative only and final terms may vary based on a full review of the account profile, creditor mix, and servicing rules.
      </div>
    </section>
  </div>
</body>
</html>
  `;
}

function renderPdfHtml(plan) {
  const name = fullName(plan.firstName, plan.lastName);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(name)} - Funding Tier Debt Resolution Summary</title>
</head>
<body style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${BRAND.text}; background:#fff;">
  <div style="padding:30px 34px;">
    ${renderHeaderBlock(
      'Funding Tier Debt Resolution Summary',
      'This summary compares the current financial situation against the structured program estimate.'
    )}

    <div style="margin-bottom:22px; padding:18px; border:1px solid ${BRAND.border}; border-radius:18px; background:${BRAND.softBg};">
      <div style="font-size:16px; font-weight:700;">Prepared for: ${escapeHtml(name)}</div>
      <div style="margin-top:8px; font-size:14px; color:${BRAND.muted};">State: ${escapeHtml(plan.state || '—')}</div>
      ${
        plan.route
          ? `<div style="margin-top:4px; font-size:14px; color:${BRAND.muted};">Recommended Route: ${escapeHtml(plan.route)}</div>`
          : ''
      }
    </div>

    <div style="overflow:hidden; border:1px solid ${BRAND.border}; border-radius:18px;">
      ${renderComparisonTable(plan, { compact: true })}
    </div>

    <div style="margin-top:24px; padding:18px; border:1px solid ${BRAND.border}; border-radius:18px; background:${BRAND.successBg};">
      <div style="font-size:18px; font-weight:800; color:${BRAND.primaryDark};">
        Estimated Savings vs Current Path:
        ${currency(
          Math.max(
            0,
            (Number(plan?.doNothing?.totalPayback) || 0) - (Number(plan?.recommended?.totalCost) || 0)
          )
        )}
      </div>
      <div style="margin-top:8px; font-size:14px; line-height:1.7; color:${BRAND.muted};">
        These estimates are intended to show how continuing minimum payments may lead to a substantially higher total payback than a structured debt resolution program.
      </div>
    </div>

    <div style="margin-top:24px;">
      <div style="font-size:18px; font-weight:800; margin-bottom:10px;">Accounts Reviewed</div>
      ${renderDebtItems(plan.rows || [])}
    </div>

    <div style="margin-top:22px; font-size:12px; line-height:1.8; color:#64748b;">
      These estimates are illustrative only. Final terms, affordability, and program structure may vary based on account review, state eligibility, servicing rules, and creditor profile.
    </div>
  </div>
</body>
</html>
  `;
}

function renderEmailHtml(plan) {
  const firstName = escapeHtml(plan.firstName || 'there');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Funding Tier Debt Resolution Comparison</title>
</head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:Arial, Helvetica, sans-serif; color:${BRAND.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; background:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 45%, ${BRAND.accent} 100%); padding:28px;">
              <img src="${FUNDING_TIER_LOGO}" alt="Funding Tier Logo" style="width:160px; height:auto; display:block; margin-bottom:18px;" />
              <div style="font-size:30px; font-weight:800; line-height:1.15; color:#ffffff;">
                Your debt resolution comparison is ready
              </div>
              <div style="margin-top:10px; font-size:16px; line-height:1.7; color:rgba(255,255,255,0.94);">
                Review your personalized comparison page and attached PDF summary.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <div style="font-size:16px; line-height:1.8; color:${BRAND.text};">
                Hi ${firstName},
              </div>

              <div style="margin-top:14px; font-size:15px; line-height:1.8; color:${BRAND.muted};">
                We prepared a personalized comparison to help you understand the difference between your current financial path and the structured debt resolution program being recommended.
              </div>

              <div style="margin-top:20px; padding:18px; border:1px solid ${BRAND.border}; border-radius:18px; background:${BRAND.softBg};">
                <div style="font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:#64748b;">Quick Snapshot</div>
                <div style="margin-top:10px; font-size:15px; line-height:1.8; color:${BRAND.text};">
                  Total Debt Reviewed: <strong>${currency(plan.totalDebt || 0)}</strong><br/>
                  Recommended Route: <strong>${escapeHtml(plan.route || 'N/A')}</strong><br/>
                  Estimated Savings vs Current Path:
                  <strong style="color:${BRAND.primaryDark};">${currency(
                    Math.max(
                      0,
                      (Number(plan?.doNothing?.totalPayback) || 0) - (Number(plan?.recommended?.totalCost) || 0)
                    )
                  )}</strong>
                </div>
              </div>

              <div style="margin-top:24px;">
                <a href="${escapeHtml(plan.pageUrl || '#')}" style="display:inline-block; padding:14px 22px; border-radius:14px; text-decoration:none; font-weight:700; background:linear-gradient(90deg, ${BRAND.primaryDark}, ${BRAND.accent}); color:#fff;">
                  View Your Personalized Plan
                </a>
              </div>

              <div style="margin-top:14px; font-size:14px; line-height:1.8; color:${BRAND.muted};">
                Your PDF summary is also attached for convenience. You can also access it directly here:
                <br/>
                <a href="${escapeHtml(plan.pdfUrl || '#')}" style="color:${BRAND.primaryDark}; font-weight:700; text-decoration:none;">
                  ${escapeHtml(plan.pdfUrl || '')}
                </a>
              </div>

              <div style="margin-top:24px; font-size:14px; line-height:1.8; color:${BRAND.muted};">
                If you are ready to move forward, the next step is to complete your review with Funding Tier so your final program structure can be confirmed.
              </div>

              <div style="margin-top:24px; font-size:15px; line-height:1.8; color:${BRAND.text};">
                <strong>${BRAND.name}</strong><br/>
                <a href="${BRAND.phoneHref}" style="color:${BRAND.primaryDark}; text-decoration:none;">${BRAND.phone}</a><br/>
                <a href="${BRAND.website}" style="color:${BRAND.primaryDark}; text-decoration:none;">${BRAND.website}</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px; border-top:1px solid ${BRAND.border}; font-size:12px; line-height:1.8; color:#64748b;">
              This email and any attachments are intended solely for the use of the intended recipient(s) and may contain confidential or privileged information. Estimates are illustrative only and final terms may vary based on full review and eligibility.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function renderEmailText(plan) {
  const savings = Math.max(
    0,
    (Number(plan?.doNothing?.totalPayback) || 0) - (Number(plan?.recommended?.totalCost) || 0)
  );

  return [
    `Hi ${plan.firstName || 'there'},`,
    '',
    'We prepared a personalized comparison to help you understand the difference between your current financial path and the structured debt resolution program being recommended.',
    '',
    `Total Debt Reviewed: ${currency(plan.totalDebt || 0)}`,
    `Recommended Route: ${plan.route || 'N/A'}`,
    `Estimated Savings vs Current Path: ${currency(savings)}`,
    '',
    `View Your Personalized Plan: ${plan.pageUrl || ''}`,
    `PDF Summary: ${plan.pdfUrl || ''}`,
    '',
    'Funding Tier',
    BRAND.phone,
    BRAND.website
  ].join('\n');
}

module.exports = {
  FUNDING_TIER_LOGO,
  BRAND,
  currency,
  escapeHtml,
  slugify,
  fullName,
  buildPlanSlug,
  buildPlanUrls,
  comparisonRows,
  renderPlanPageHtml,
  renderPdfHtml,
  renderEmailHtml,
  renderEmailText
};
