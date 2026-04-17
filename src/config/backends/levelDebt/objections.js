export const objections = {
  validation:
    "Level Debt is not debt validation. It is a debt settlement path for qualified accounts.",
  monthlyPayment:
    "Level Debt is often a better fit when the prospect wants affordability and lower monthly burden over time.",
  lawsuit:
    "No one can promise a creditor will not take action. Outcomes vary by account and creditor.",
  guarantee:
    "Settlement outcomes vary. Specific savings cannot be guaranteed.",
  creditImpact:
    "Debt settlement may negatively impact credit during the program.",

  get(key) {
    return this[key] || null;
  }
};
