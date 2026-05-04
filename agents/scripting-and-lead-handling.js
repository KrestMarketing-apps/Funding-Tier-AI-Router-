window.SCRIPTING_AND_LEAD_HANDLING = {

  contextRules: {
    communicationMode: "phone_call_only",
    leadSourceLanguage: "response_based",
    avoidPhrases: [
      "you called in",
      "when you came in",
      "let me show you",
      "look here",
      "as you can see"
    ],
    preferredPhrases: [
      "you responded about",
      "based on what I’m seeing on my end",
      "let me walk you through",
      "let me explain what came back"
    ]
  },

  qualificationRules: {
    minimumDebt: 4500,
    minimumPayment: 250
  },

  warmTransfer: {

    rapidFireQual: {
      title: "Rapid Fire Qual",
      script: `Debt amount?

Working?

$250/month doable?

Looking to handle this now?`
    },

    ultraFastQual: {
      title: "Ultra Fast Qual",
      script: `Total unsecured debt?

Steady income?

$250 workable?

Ready to fix this now?`
    },

    qualified: {
      title: "Qualified Transition",
      script: `Perfect — you qualify. Let’s get this set up.`
    },

    disqualified: {
      title: "Disqualify",
      script: `Based on what you're telling me, this wouldn't be the right fit right now.`
    }
  },

  leadTransitions: {

    loanToProgram: {
      title: "Loan → Program Transition",
      script: `You responded about a loan option, and that’s what we checked first.

Based on what came back, the loan is not the strongest path right now because the balances and debt-to-income are working against you.

The good news is we found a better option to lower your monthly pressure and address the accounts directly.

Let me walk you through that now.`
    }

  },

  programScripts: {

    debtSettlement: {
      name: "Debt Settlement",
      script: `Based on what I'm seeing, the debt settlement option makes the most sense.

This is a federally regulated program designed to lower your monthly obligation.

There is no money out of pocket today, and you can cancel at any time.

The goal is to lock in the lowest possible program payment based on your situation right now.

Let’s secure this.`
    },

    debtValidation: {
      name: "Debt Validation",
      script: `Based on your situation, the validation approach may be the better fit.

Instead of just paying into the debt, this challenges and verifies the accounts.

The goal is to reduce the burden and move you into a structured resolution.

Let’s get this started.`
    },

    debtWaiverELP: {
      name: "Debt Waiver / Elite Legal Practice",
      script: `Based on what I'm seeing, the Elite Legal Practice option is the strongest fit.

This is a legal debt dispute and resolution program.

You’ll have legal representation, and the process focuses on challenging and resolving the accounts under consumer protection laws.

The fees are for legal services, not to pay creditors, and this is not a loan.

Let’s secure this now.`
    }
  },

  objections: {

  spouse: {
    title: "Spouse Objection",
    triggers: ["spouse", "wife", "husband", "partner"],
    script: `I understand — we can go over it together, but first let’s secure the structure so you don’t lose the option.

There is no money out of pocket today, and you can cancel if it doesn’t make sense.

Let’s lock it in now.`
  },

  think: {
    title: "Think About It",
    triggers: ["think", "later", "not sure", "need time"],
    script: `What specifically do you need to think through?

Let’s clear that up right now so you’re making a decision based on facts.`
  },

  callBack: {
    title: "Call Back",
    triggers: ["call back", "later today", "tomorrow", "another time"],
    script: `We already have everything in front of us right now.

This takes a couple minutes and there’s no money out of pocket today.

Let’s finish it while we’re here.`
  },

  trust: {
    title: "Trust",
    triggers: ["scam", "real", "legit", "trust", "how do I know"],
    script: `That’s a fair question.

Everything we’re discussing is based on your actual numbers.

I’ll walk you through it so you understand exactly what this is before anything is finalized.`
  }

},
  
  helper: {

    mapRouteToProgram: function(route){
      if(route === "LEVEL") return "debtSettlement";
      if(route === "CONSUMER SHIELD") return "debtValidation";
      if(route === "LEGACY") return "debtWaiverELP";
      return "debtSettlement";
    }

  }

};
