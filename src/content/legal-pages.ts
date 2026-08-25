export const legalPages = {
  "/safety": {
    title: "Safety at Chorezy",
    description: "How Chorezy is approaching helper eligibility, guardian involvement, communication, payments, and safety reporting.",
    eyebrow: "Safety overview",
    intro: "Chorezy is being built for real-world neighborhood work. That means safety decisions must be part of the product, not a paragraph added later.",
    sections: [
      ["Clear helper types", "Young Helpers and Adult Helpers have different eligibility needs. Chorezy is designed to keep those differences visible throughout discovery and task participation."],
      ["Guardian involvement", "Young Helper participation is designed around guardian visibility and approval controls appropriate to the account and task."],
      ["Account and task controls", "Verification, task eligibility, reporting, and emergency-support tooling are part of the launch architecture. Exact availability may vary during testing and rollout."],
      ["Protected communication and payment flows", "Keeping task communication and payment activity within the product creates a clearer record and supports safer issue resolution."],
    ],
  },
  "/privacy": {
    title: "Chorezy Privacy Notice",
    description: "A plain-language privacy notice for the Chorezy North America launch waitlist.",
    eyebrow: "Privacy notice",
    intro: "This notice covers information submitted through the Chorezy launch waitlist. It is not the final in-app privacy policy for the public marketplace.",
    sections: [
      ["What we collect", "The waitlist collects your email address, intended role, country, and ZIP or postal code. We may also store a referral code and basic technical records needed to secure the form."],
      ["Why we collect it", "We use the information to understand regional demand, plan the United States and Canada rollout, prevent abuse, and send relevant launch updates."],
      ["How it is shared", "We use service providers that support website hosting, database storage, security, and email delivery. We do not sell waitlist information."],
      ["Your choices", "You can unsubscribe from launch emails at any time. To request access or deletion, email privacy@chorezy.com from the address you used to join."],
    ],
  },
  "/terms": {
    title: "Chorezy Waitlist Terms",
    description: "Terms for joining the Chorezy North America launch waitlist.",
    eyebrow: "Waitlist terms",
    intro: "Joining the Chorezy waitlist expresses interest in the product. It does not create a marketplace account, guarantee launch availability, or reserve paid services.",
    sections: [
      ["Eligibility", "The current waitlist is intended for people and businesses located in the United States or Canada. Young people should join with the knowledge of a parent or guardian."],
      ["Launch communications", "By joining, you agree to receive Chorezy launch and availability updates. You can unsubscribe through any marketing email."],
      ["No guarantee of availability", "Launch timing, supported locations, product features, and eligibility requirements may change as testing and regional rollout continue."],
      ["Contact", "Questions about these waitlist terms can be sent to hello@chorezy.com."],
    ],
  },
} as const;

export type LegalPath = keyof typeof legalPages;
