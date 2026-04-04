export type CreditorDbItem = {
  name: string;
  category: string;
  class: string;
  notes: string;
};

export const NON_SERVICEABLE_LEVEL = ["AK", "OR", "RI", "VT", "WV"];
export const CONSUMER_SHIELD_NON_SERVICEABLE: string[] = [];
export const DEFAULT_MIN_PAYMENT = 225;
export const DISCOVER_LIMIT_PCT = 60;

export const CREDITOR_DB: CreditorDbItem[] = [
  { name: "American Express", category: "Credit Card", class: "Unsecured", notes: "Standard unsecured revolving debt" },
  { name: "Amex", category: "Credit Card", class: "Unsecured", notes: "Alias of American Express" },
  { name: "Bank of America", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Usually eligible if unsecured" },
  { name: "Capital One", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Usually eligible if unsecured" },
  { name: "Chase", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Usually eligible if unsecured" },
  { name: "Citi", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Usually eligible if unsecured" },
  { name: "Citibank", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Usually eligible if unsecured" },
  { name: "Discover", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Track concentration; exception if >60%" },
  { name: "Discover Card", category: "Credit Card", class: "Unsecured", notes: "Track concentration carefully" },
  { name: "Wells Fargo", category: "Credit Card / Personal Loan", class: "Unsecured", notes: "Usually eligible if unsecured" },
  { name: "Barclays", category: "Credit Card", class: "Unsecured", notes: "Standard unsecured" },
  { name: "Synchrony", category: "Retail Card / Credit Card", class: "Unsecured", notes: "Usually retail or revolving" },
  { name: "Comenity", category: "Retail Card", class: "Unsecured", notes: "Store card debt" },
  { name: "Upgrade", category: "Personal Loan", class: "Unsecured", notes: "Unsecured installment" },
  { name: "Upstart", category: "Personal Loan", class: "Unsecured", notes: "Unsecured installment" },
  { name: "LendingClub", category: "Personal Loan", class: "Unsecured", notes: "Unsecured installment" },
  { name: "Prosper", category: "Personal Loan", class: "Unsecured", notes: "Unsecured installment" },
  { name: "Best Egg", category: "Personal Loan", class: "Unsecured", notes: "Unsecured installment" },
  { name: "Avant", category: "Personal Loan", class: "Unsecured", notes: "Unsecured installment" },
  { name: "OneMain Financial", category: "Personal Loan", class: "Unknown", notes: "Can be secured or unsecured; verify structure" },
  { name: "SoFi", category: "Personal Loan", class: "Unsecured", notes: "Usually unsecured personal loan" },
  { name: "LightStream", category: "Personal Loan", class: "Unsecured", notes: "Usually unsecured personal loan" },
  { name: "Navient", category: "Student Loan", class: "Generally Excluded", notes: "Student loans usually not standard debt settlement fit" },
  { name: "Nelnet", category: "Student Loan", class: "Generally Excluded", notes: "Student loans usually excluded" },
  { name: "MOHELA", category: "Student Loan", class: "Generally Excluded", notes: "Student loans usually excluded" },
  { name: "FedLoan", category: "Student Loan", class: "Generally Excluded", notes: "Student loans usually excluded" },
  { name: "Affirm", category: "Consumer Financing", class: "Unsecured", notes: "Often unsecured consumer financing" },
  { name: "Klarna", category: "Consumer Financing", class: "Unsecured", notes: "Often unsecured consumer financing" },
  { name: "Afterpay", category: "Consumer Financing", class: "Unsecured", notes: "Often unsecured consumer financing" },
  { name: "PayPal Credit", category: "Consumer Financing", class: "Unsecured", notes: "Usually unsecured" },
  { name: "CareCredit", category: "Medical Financing", class: "Unsecured", notes: "Often unsecured medical financing" },
  { name: "Medical Bill", category: "Medical", class: "Unsecured", notes: "Can be accepted depending on backend" },
  { name: "Collection Agency", category: "Collection", class: "Unsecured", notes: "Usually unsecured if tied to unsecured account" },
  { name: "Portfolio Recovery", category: "Collection", class: "Unsecured", notes: "Collection debt; verify underlying account" },
  { name: "Midland Credit", category: "Collection", class: "Unsecured", notes: "Collection debt; verify underlying account" },
  { name: "LVNV Funding", category: "Collection", class: "Unsecured", notes: "Collection debt; verify underlying account" },
  { name: "Back Rent", category: "Rent", class: "Conditional", notes: "Can be limited share depending on backend rules" },
  { name: "Repossessed Auto Deficiency", category: "Auto Deficiency", class: "Unsecured", notes: "Post-repo deficiency often unsecured" },
  { name: "Auto Loan", category: "Vehicle Loan", class: "Secured", notes: "Active vehicle loan is secured" },
  { name: "Mortgage", category: "Mortgage", class: "Secured", notes: "Secured real estate debt" },
  { name: "HELOC", category: "Home Equity", class: "Secured", notes: "Secured by home" },
  { name: "IRS", category: "Tax Debt", class: "Generally Excluded", notes: "Tax debt generally excluded" },
  { name: "State Tax", category: "Tax Debt", class: "Generally Excluded", notes: "Tax debt generally excluded" },
  { name: "Title Loan", category: "Title Loan", class: "Secured", notes: "Secured by vehicle title" },
  { name: "Payday Loan", category: "Short-Term Loan", class: "Unsecured", notes: "Usually unsecured" }
];
