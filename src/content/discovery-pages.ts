export type DiscoveryPageData = {
  slug: string;
  path: string;
  eyebrow: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  highlights: readonly string[];
  sections: readonly (readonly [string, string])[];
};

export const chorePages = {
  "yard-care": {
    slug: "yard-care",
    path: "/chores/yard-care/",
    eyebrow: "Yard care chores",
    title: "Find yard work nearby—or earn by helping outdoors.",
    seoTitle: "Yard Work Near Me: Local Help & Jobs | Chorezy",
    description: "Join the Chorezy U.S. waitlist for local yard work, lawn cleanup, leaf removal, watering, and other neighborhood outdoor chores.",
    intro: "Chorezy is being built to help households describe outdoor work clearly and let eligible local helpers decide which nearby opportunities fit their skills and schedule.",
    highlights: ["Lawn and garden cleanup", "Leaves, watering, and light outdoor help", "Clear timing, budget, checklist, and photos"],
    sections: [
      ["For busy households", "Turn the outdoor jobs sitting on your list into a clear chore with timing, budget, photos, and a checklist. Compare offers before choosing a helper."],
      ["For local helpers", "Browse eligible yard-care opportunities close to home and make an offer when the work, timing, and expectations suit you."],
      ["Designed for a clear handoff", "In-app details, communication, arrival updates, and completion records are being designed to keep both sides aligned."],
    ],
  },
  "pet-care": {
    slug: "pet-care",
    path: "/chores/pet-care/",
    eyebrow: "Pet care chores",
    title: "Make everyday pet help easier to arrange nearby.",
    seoTitle: "Local Pet Care Help & Chores | Chorezy",
    description: "Join the Chorezy U.S. waitlist for nearby pet care chores such as walks, feeding support, and routine pet help.",
    intro: "For families balancing work, school, and travel, small pet-care gaps can be hard to coordinate. Chorezy is being built around clear task details and eligible local help.",
    highlights: ["Dog walking and routine visits", "Feeding and simple care instructions", "Task details kept in one place"],
    sections: [
      ["Set expectations before the chore", "Posters can describe the pet, routine, timing, access instructions, budget, and any important context before selecting a helper."],
      ["Choose work that fits", "Eligible helpers can review the requirements and make an offer only when the task is a suitable match."],
      ["Safety is part of the flow", "Chorezy is designing identity, eligibility, in-app communication, reporting, and active-task safety tools into the marketplace."],
    ],
  },
  errands: {
    slug: "errands",
    path: "/chores/errands/",
    eyebrow: "Local errands",
    title: "Get help with local errands when the day is already full.",
    seoTitle: "Local Errand Help & Jobs | Chorezy",
    description: "Join the Chorezy U.S. waitlist to post eligible local errands or find nearby errand work as an Adult Helper.",
    intro: "Chorezy is being built for the practical jobs that consume time: local pickups, drop-offs, and other eligible errands with clear instructions and progress updates.",
    highlights: ["Local pickups and drop-offs", "Timing and checklist details", "Adult Helper opportunities"],
    sections: [
      ["For working parents and busy households", "Describe what needs to happen, where, and by when—then compare offers from eligible helpers instead of coordinating across multiple apps."],
      ["For Adult Helpers ages 18+", "Find nearby errand opportunities that fit your availability, review the requirements, and decide what you want to offer."],
      ["Know what is happening", "Arrival and progress updates are being designed to give posters a clearer view from acceptance through completion."],
    ],
  },
  "home-help": {
    slug: "home-help",
    path: "/chores/home-help/",
    eyebrow: "Help around the home",
    title: "Move the household list forward with local help.",
    seoTitle: "Household Chore Help Near You | Chorezy",
    description: "Join the Chorezy U.S. waitlist for cleaning help, organizing, moving assistance, and other eligible household chores nearby.",
    intro: "From one-off cleanup to repeating household tasks, Chorezy is being built to make the work, budget, timing, and helper offers easier to understand.",
    highlights: ["Cleaning and organizing help", "Light moving and household tasks", "One-time or repeating chores"],
    sections: [
      ["Post a chore with useful context", "Add the scope, checklist, photos or voice context, timing, location, and budget so helpers can assess the work before making an offer."],
      ["Compare before you choose", "Posters remain in control of which eligible helper they select. Chorezy is not designed to assign a stranger automatically."],
      ["Keep a completion record", "Task communication, completion proof, reviews, payments, and dispute support are being designed into a single chore flow."],
    ],
  },
} satisfies Record<string, DiscoveryPageData>;

export const earnPages = {
  "young-helpers": {
    slug: "young-helpers",
    path: "/earn/young-helpers/",
    eyebrow: "Young Helpers · ages 14–17",
    title: "A local way for teens to earn with guardian involvement.",
    seoTitle: "Paid Chores for Teens Ages 14–17 | Chorezy",
    description: "Chorezy Young Helpers are ages 14–17. Join the U.S. waitlist for age-appropriate local chore opportunities designed around guardian visibility.",
    intro: "Chorezy is being designed for teens who want to earn after school, on weekends, or during school breaks—without treating Young Helpers like Adult Helpers.",
    highlights: ["For ages 14–17", "Guardian visibility and approval controls", "Age-appropriate eligible chores"],
    sections: [
      ["Built around a distinct helper type", "Young Helper eligibility is designed to remain visible throughout discovery and task participation, with different controls from Adult Helper accounts."],
      ["A practical option during school breaks", "Eligible nearby chores can give teens a structured way to use free time, practice responsibility, and earn within the product’s rules."],
      ["Guardians stay part of the process", "Guardian-linked visibility and approval controls are part of the planned experience. Exact requirements may vary as launch testing continues."],
    ],
  },
  "adult-helpers": {
    slug: "adult-helpers",
    path: "/earn/adult-helpers/",
    eyebrow: "Adult Helpers · ages 18+",
    title: "Find flexible local work that fits around your schedule.",
    seoTitle: "Flexible Local Chore Jobs for Adults | Chorezy",
    description: "Chorezy Adult Helpers are ages 18+. Join the U.S. waitlist to find eligible yard care, errands, pet care, and household chores nearby.",
    intro: "Adult Helpers will be able to discover nearby opportunities, review the work and budget, and make an offer when a chore fits their availability and skills.",
    highlights: ["For ages 18+", "Choose suitable nearby opportunities", "Make an offer before work begins"],
    sections: [
      ["You decide what fits", "Chorezy is being built around opt-in offers rather than automatic job assignment. Review the details before choosing whether to participate."],
      ["Keep the task organized", "Instructions, communication, progress, completion, and payout steps are being designed to stay with the chore."],
      ["Multiple kinds of local work", "Launch categories include yard care, pet care, errands, home help, and other eligible tasks, with availability varying by location."],
    ],
  },
} satisfies Record<string, DiscoveryPageData>;

export const helpPages = {
  "working-families": {
    slug: "working-families",
    path: "/help/working-families/",
    eyebrow: "For working moms and busy families",
    title: "Make room in a full week with trusted local help.",
    seoTitle: "Local Chore Help for Busy Families | Chorezy",
    description: "Chorezy helps working moms and busy U.S. families plan local yard care, pet care, errands, and home help in one chore flow.",
    intro: "When work, school, care, and home all compete for the same hours, even a small chore can stall the week. Chorezy is being built to make asking for nearby help clearer and more manageable.",
    highlights: ["Describe the chore once", "Compare eligible helper offers", "Follow progress in one place"],
    sections: [
      ["Turn mental load into a clear plan", "Add the task, checklist, timing, location, budget, and optional photos or voice context instead of repeating the same instructions across messages."],
      ["Stay in control of the choice", "Compare offers and select the eligible helper who fits the work. Guardian and helper-type information is designed to remain visible where relevant."],
      ["Built for the real task, not just discovery", "Arrival updates, in-app communication, protected payment flows, completion proof, reviews, and safety reporting are part of the product direction."],
    ],
  },
} satisfies Record<string, DiscoveryPageData>;
