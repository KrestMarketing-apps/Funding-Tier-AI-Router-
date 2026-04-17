export const crmActions = {
  assignModel(lead, backend) {
    return {
      ...lead,
      assignedBackend: "LEVEL_DEBT",
      serviceModel: backend.routing.isAttorneyModelState(lead?.state)
        ? "ATTORNEY_MODEL"
        : "STANDARD_MODEL"
    };
  }
};
