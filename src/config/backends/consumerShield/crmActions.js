export const crmActions = {
  assignProgram(lead, backend) {
    const program = backend?.agentcommission?.getProgram
      ? backend.agentcommission.getProgram(lead?.totalDebt)
      : null;

    return {
      ...lead,
      assignedBackend: "CONSUMER_SHIELD",
      assignedProgram: program?.code || null,
      assignedProgramType: "DEBT_VALIDATION",
      routingStatus: "READY_FOR_TRANSFER"
    };
  },

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
  },

  markConditional(lead, reason = "Conditional debt type or creditor requires review") {
    return {
      ...lead,
      status: "CONDITIONAL_REVIEW",
      reviewReason: reason,
      tasks: [...(lead?.tasks || []), "Review Consumer Shield conditional"]
    };
  },

  markRejected(lead, reason = "Not eligible for Consumer Shield") {
    return {
      ...lead,
      status: "REJECTED",
      routingStatus: "NO_MATCH",
      rejectReason: reason,
      tasks: [...(lead?.tasks || []), "Consumer Shield rejection review"]
    };
  }
};
