import { legacyBackend } from "@/config/backends/legacy";
import { consumerShieldBackend } from "@/config/backends/consumerShield";
import { levelDebtBackend } from "@/config/backends/levelDebt";

export const backendRegistry = {
  all: {
    legacy: legacyBackend,
    consumerShield: consumerShieldBackend,
    levelDebt: levelDebtBackend
  },

  getAll() {
    return Object.values(this.all);
  },

  getById(id) {
    return this.getAll().find((b) => b.id === id) || null;
  },

  getByName(name) {
    const q = String(name || "").toLowerCase();
    return this.getAll().find((b) =>
      b.name.toLowerCase().includes(q) ||
      b.display?.label?.toLowerCase().includes(q)
    ) || null;
  }
};
