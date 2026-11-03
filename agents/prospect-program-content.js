// Prospect-facing program copy for the AI Deal Router's Prospect Delivery.
//
// ONE source of truth, used in three places:
//   - api/generate-plan.js + api/plan.js import it (server) to build the
//     personalized /plan/{name}/{token} page.
//   - api/send-savings-email.js imports it (server) for the email footer.
//   - index.html loads it as <script type="module"> (browser) so the jsPDF
//     summary uses the exact same wording.
//
// Keys match the router's internal route keys. Prospect-facing copy names the
// program TYPE only — never the servicing company (Shield Services, Level Debt,
// Elite Legal Practice).
//
// Compliance notes (debt settlement): say "debt settlement", never
// "consolidation"; say "deposits", not "payments"; outcomes vary; note the
// short-term credit impact; no guarantees. Do not claim a law-firm partnership
// in copy that shows in every state — that claim is only allowed in
// attorney-model states.
//
// Compliance notes (debt validation): do not state what creditors "must" do
// or where the burden of proof sits. Describe verification as something a
// collector can be asked to do, and disputes as something that can be raised.

export const PROGRAM_CONTENT = {
  'CONSUMER SHIELD': {
    key: 'CONSUMER SHIELD',
    publicName: 'Debt Validation Program',
    paymentLabel: 'Monthly Program Payment',
    tagline:
      'A fixed-price program that reviews your enrolled accounts and asks creditors and collectors to verify the debts they say you owe.',
    howItWorks: [
      'Your enrolled accounts are reviewed and formally challenged under federal consumer protection laws.',
      'Under federal consumer protection law, debt collectors can be asked to verify a debt before continuing collection.',
      'Accounts that are not properly verified can be disputed for correction or removal.',
      'You make one fixed monthly program payment instead of juggling multiple creditor payments.'
    ],
    benefits: [
      'One fixed monthly payment — the program charges you no interest',
      'Your program price is set up front and does not grow over time',
      'Verification requests and disputes are prepared and sent on your behalf',
      'Replaces minimum payments that mostly go toward interest',
      'A clear finish line instead of open-ended minimum payments'
    ],
    debtOutcome:
      'The program fee covers the review and dispute work. Accounts that are verified as valid may still be owed, and creditors may continue to charge interest on open accounts.',
    disclosure:
      'Debt validation does not guarantee that any account will be removed, reduced or resolved. Results vary by account and creditor. Your credit may be impacted during the program. This is general program education, not legal advice.'
  },

  LEVEL: {
    key: 'LEVEL',
    publicName: 'Debt Settlement Program',
    paymentLabel: 'Monthly Program Deposit',
    tagline:
      'A structured program that negotiates your enrolled debts for less than the full balance owed.',
    howItWorks: [
      'You make one monthly deposit into a dedicated account held in your name.',
      'As your account builds, negotiators work with each creditor to settle enrolled accounts for less than the full balance.',
      'You approve every settlement before any funds are released.',
      'Fees are only charged after a settlement is reached and a payment is made on that account.'
    ],
    benefits: [
      'One monthly program deposit in place of multiple creditor payments',
      'No upfront fees',
      'You stay in control — you approve each settlement',
      'Program deposits carry no interest',
      'An estimated program length instead of open-ended minimum payments',
      'The program cost shown is an estimate that depends on what creditors accept'
    ],
    debtOutcome:
      'Your program deposits build the funds used to settle enrolled accounts. Settlements depend on what each creditor accepts and are not guaranteed.',
    disclosure:
      'Debt settlement results vary and not all creditors agree to settle. The program cost shown is an estimate that depends on what each creditor accepts. Your credit may be impacted in the short term while accounts are being negotiated. Forgiven amounts may have tax consequences. This is general program education, not legal advice.'
  },

  LEGACY: {
    key: 'LEGACY',
    publicName: 'Debt Resolution Program',
    paymentLabel: 'Monthly Program Payment',
    tagline:
      'An attorney-led debt resolution program where a legal team reviews, disputes and works to resolve your enrolled debts on your behalf.',
    howItWorks: [
      'A legal team reviews each enrolled account for errors, violations and missing documentation.',
      'Accounts are disputed and challenged, and the legal team works toward resolving each enrolled debt.',
      'You make one fixed monthly payment for the length of the program.',
      'If you are sued after enrollment, legal defense is available for an additional fee ($675 if the summons arrives within one year of enrollment; $850 if the account is not enrolled).'
    ],
    benefits: [
      'Attorney-led — a legal team works on your behalf',
      'One fixed monthly payment with no interest',
      'Program length sized to fit your monthly budget',
      'Litigation support available if you are sued after enrollment (additional fee: $675 if the summons arrives within one year of enrollment; $850 if the account is not enrolled)',
      'A clear finish line instead of open-ended minimum payments'
    ],
    debtOutcome:
      'The program fee covers attorney-led dispute and resolution work. Accounts that are verified as valid may still be owed.',
    disclosure:
      'This is general program education, not legal advice. Legal outcomes, dispute results, creditor and collector responses, credit impact, fees and timelines vary by client situation.'
  }
};

export const DO_NOTHING_COPY = {
  heading: 'The Cost Of Doing Nothing',
  intro:
    'Credit card and loan interest compounds — you are charged interest on top of interest every month. Minimum payments are designed to keep you paying for years, and most of each payment goes to interest instead of your balance.',
  disclosure:
    'Current-path figures are estimates that assume no new purchases, no late payments, no added fees, no penalty APR and no APR changes. Collection agencies may add their own interest or fees. Actual results may differ.'
};

// Shown on every PDF page and on the plan webpage. Everything the prospect
// sees is an estimate — say so plainly and often.
export const ESTIMATE_DISCLOSURE =
  'All figures are estimates for illustration only, based on the information provided and the assumptions noted. Actual balances, interest, fees, program terms, savings, timelines and outcomes may change and are not guaranteed.';

export const CREDIT_RUNWAY_COPY = {
  heading: 'How Fast Interest Can Use Up Your Available Credit',
  intro:
    'On cards that are still open (not in collections), interest is added to your balance every month. When your payment does not keep up with that interest — or if payments stop — the balance climbs toward your credit limit and your available credit disappears.',
  disclosure:
    'Estimates assume monthly compounding at the APR shown, no new purchases and no APR changes. Late fees, over-limit fees or a penalty APR, if charged, would use up available credit faster. Card issuers may also lower credit limits or close accounts at any time. Actual results may differ.'
};

// Plain-English disclosures shown on the plan page, the PDF and the email.
// Keep each under 25 words.
export const REQUIRED_DISCLOSURES = [
  'All figures shown are estimates based on the information you provided.',
  'This is not a loan and not a government program.',
  'Enrolling in a program may affect your credit.',
  'Creditors and collectors may continue to contact you and may pursue collection or legal action.',
  'Interest and fees may continue to accrue on accounts until they are resolved.',
  'Program fees, timelines and results vary by account and by individual situation.',
  'This information is not legal, tax or financial advice.'
];

// Explains why minimum-only payoff takes so long. Shown under the
// cost-of-doing-nothing figures when minimum-only numbers are present.
export const MINIMUM_PAYMENT_NOTE =
  "Most credit cards set the minimum payment at about 1% of the balance plus that month's interest, with a floor of $25 to $40. As the balance drops, the required minimum drops with it, which is why minimum-only payoff takes many years. Installment loans are not calculated this way.";

export function programContentFor(key) {
  return Object.prototype.hasOwnProperty.call(PROGRAM_CONTENT, key)
    ? PROGRAM_CONTENT[key]
    : null;
}

if (typeof window !== 'undefined') {
  window.FT_PROGRAM_CONTENT = {
    PROGRAM_CONTENT,
    DO_NOTHING_COPY,
    ESTIMATE_DISCLOSURE,
    CREDIT_RUNWAY_COPY,
    REQUIRED_DISCLOSURES,
    MINIMUM_PAYMENT_NOTE,
    programContentFor
  };
}
