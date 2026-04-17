export const crmActions = {
  handleDNC(lead) {
    return {
      ...lead,
      status: "DO_NOT_CALL",
      stage: "INACTIVE",
      tasks: [...(lead?.tasks || []), "DNC Request"]
    };
  },

  removeFromMarketing(lead) {
    return {
      ...lead,
      status: "NOT_INTERESTED",
      tasks: [...(lead?.tasks || []), "Remove from marketing"]
    };
  }
};
