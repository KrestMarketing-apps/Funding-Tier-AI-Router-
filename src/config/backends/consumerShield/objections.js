export const objections = {
  settlement:
    "Consumer Shield is not debt settlement. It uses a debt validation approach with a fixed monthly structure.",

  monthlyPayment:
    "Consumer Shield is often a strong fit when the prospect wants a defined monthly payment and program term.",

  guarantee:
    "No outcome can be guaranteed. Results depend on the account and creditor response.",

  credit:
    "This program is focused on addressing the debt itself, not promising credit improvement.",

  attorney:
    "Consumer Shield is validation-focused, but it is not the same as an attorney-led settlement backend.",

  fixedPayment:
    "One of the biggest advantages of Consumer Shield is the fixed payment structure, which gives the prospect a predictable monthly amount.",

  debtValidation:
    "Consumer Shield is a debt validation program, meaning the focus is on challenging and verifying debts rather than settling them.",

  whyNotSettlement:
    "If the prospect wants debt validation and a fixed monthly structure, Consumer Shield may be a better fit than settlement. If they want negotiated balance reduction, another backend may fit better.",

  timeline:
    "The term depends on the matched Consumer Shield program tier, and each tier has a defined payment and term structure.",

  get(key) {
    return this[key] || null;
  }
};
