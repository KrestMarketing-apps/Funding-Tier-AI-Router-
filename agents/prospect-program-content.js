// Prospect-facing program copy for the AI Deal Router's Prospect Delivery.
//
// ONE source of truth, used in two places:
//   - api/generate-plan.js + api/plan.js import it (server) to build the
//     personalized /plan/{name}/{token} page.
//   - index.html loads it as <script type="module"> (browser) so the jsPDF
//     summary uses the exact same wording.
//
// Keys match the router's internal route keys. Prospect-facing copy names the
// program TYPE only — never the servicing company (Shield Services, Level Debt,
// Elite Legal Practice).
//
// Compliance notes (debt settlement): say "debt settlement", never
// "consolidation"; say "deposits", not "payments"; outcomes vary; note the
// short-term credit impact; "we partner with a law firm"; no guarantees.

export const PROGRAM_CONTENT = {
  'CONSUMER SHIELD': {
    key: 'CONSUMER SHIELD',
    publicName: 'Debt Validation Program',
    paymentLabel: 'Monthly program payment',
    tagline:
      'A fixed-price program that holds your creditors and collectors to the law — they must prove the debts they say you owe.',
    howItWorks: [
      'Your enrolled accounts are reviewed and formally challenged under federal consumer protection laws.',
      'Creditors and collection agencies are required to validate each account — show that it is accurate, complete and legally collectible.',
      'Accounts that cannot be properly validated can be disputed for correction or removal.',
      'You make one fixed monthly program payment instead of juggling multiple creditor payments.'
    ],
    benefits: [
      'One fixed monthly payment — the program charges you no interest',
      'Your program price is set up front and does not grow over time',
      'Federal law puts the burden of proof on the creditor, not on you',
      'Replaces minimum payments that mostly go toward interest',
      'A clear finish line instead of open-ended minimum payments'
    ],
    disclosure:
      'Debt validation does not guarantee that any account will be removed, reduced or resolved. Results vary by account and creditor. Your credit may be impacted during the program. This is general program education, not legal advice.'
  },

  LEVEL: {
    key: 'LEVEL',
    publicName: 'Debt Settlement Program',
    paymentLabel: 'Monthly program deposit',
    tagline:
      'We partner with a law firm to negotiate your enrolled debts for less than the full balance owed.',
    howItWorks: [
      'You make one monthly deposit into a dedicated account held in your name.',
      'As your account builds, negotiators work with each creditor to settle enrolled accounts for less than the full balance.',
      'You approve every settlement before any funds are released.',
      'Fees are only charged after a settlement is reached and a payment is made on that account.'
    ],
    benefits: [
      'One affordable monthly deposit in place of multiple creditor payments',
      'No upfront fees',
      'You stay in control — you approve each settlement',
      'Program deposits carry no interest',
      'A set program length instead of open-ended minimum payments'
    ],
    disclosure:
      'Debt settlement results vary and not all creditors agree to settle. Your credit may be impacted in the short term while accounts are being negotiated. Forgiven amounts may have tax consequences. This is general program education, not legal advice.'
  },

  LEGACY: {
    key: 'LEGACY',
    publicName: 'Debt Waiver Program',
    paymentLabel: 'Monthly program payment',
    tagline:
      'An attorney-led program where a legal team reviews, disputes and works to resolve your enrolled debts on your behalf.',
    howItWorks: [
      'A legal team reviews each enrolled account for errors, violations and missing documentation.',
      'Accounts are disputed and challenged, and the legal team works toward resolving each enrolled debt.',
      'You make one fixed monthly payment for the length of the program.',
      'If a creditor files a lawsuit on an enrolled account, attorney support is available (additional fees may apply).'
    ],
    benefits: [
      'Attorney-led — a legal team works on your behalf',
      'One fixed monthly payment with no interest',
      'Program length sized to fit your monthly budget',
      'Litigation support available if you are sued on an enrolled debt',
      'A clear finish line instead of open-ended minimum payments'
    ],
    disclosure:
      'This is general program education, not legal advice. Legal outcomes, dispute results, creditor and collector responses, credit impact, fees and timelines vary by client situation.'
  }
};

export const DO_NOTHING_COPY = {
  heading: 'The cost of doing nothing',
  intro:
    'Credit card and loan interest compounds — you are charged interest on top of interest every month. Minimum payments are designed to keep you paying for years, and most of each payment goes to interest instead of your balance.',
  disclosure:
    'Current-path figures are estimates that assume no new purchases, no late payments, no added fees, no penalty APR and no APR changes. Collection agencies may add their own interest or fees.'
};

export function programContentFor(key) {
  return Object.prototype.hasOwnProperty.call(PROGRAM_CONTENT, key)
    ? PROGRAM_CONTENT[key]
    : null;
}

if (typeof window !== 'undefined') {
  window.FT_PROGRAM_CONTENT = { PROGRAM_CONTENT, DO_NOTHING_COPY, programContentFor };
}
