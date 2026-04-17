import { dealRouter } from "@/tools/dealRouter";

const lead = {
  state: "CA",
  totalDebt: 12000,
  bankVerified: true,
  preference: "debt_validation",
  termMonths: 36,
  monthlyFiles: 25
};

console.log(dealRouter(lead));
