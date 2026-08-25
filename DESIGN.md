# Chorezy public website design system

## Product and audience

Chorezy is a neighborhood chore marketplace preparing to launch in the United States. The public site has one primary conversion: a location-qualified waitlist signup. It serves people who need help, Adult Helpers, Young Helpers and their guardians, and local businesses.

## Visual character

- Reading: a premium consumer marketplace landing page for households, helpers,
  guardians, and local businesses, with a joyful neighborhood-energy language.
- Design dials: variance 8, motion 4, density 3. The page is asymmetric and
  expressive, but motion stays lightweight and purposeful.
- Use a fixed light theme with crisp white and cool-gray surfaces. Electric
  cobalt is the dominant action color; hot pink and orange appear only as
  disciplined accents drawn from the existing multicolor Chorezy mark.
- Use original human-centered lifestyle photography rather than fake product
  dashboards or generic div-based screenshots.
- Reuse the app's branded gradient family for a few expressive moments:
  `#FFA000 → #FF5533 → #FF3A6B → #8E2DE2 → #226DFF`, with
  `#00D6D6 → #226DFF → #6F21FF` as the cool wave variant. Keep reading
  surfaces neutral and avoid applying gradients to every card.
- Pair Bricolage Grotesque display type with DM Sans body type through
  `next/font`. Reserve Bricolage for major display headlines; brand text,
  navigation, buttons, subtitles, card headings, FAQs, and forms use DM Sans.
- Avoid fake testimonials, launch counts, ratings, urgency, location claims,
  generic purple mesh gradients, and three identical feature cards.

## Core tokens

- Canvas: `#f8f9ff`
- Ink: `#15213b`
- Secondary text: `#53607a`
- Primary: `#226dff`
- Primary dark: `#0044c4`
- Safety green: `#087d5b`
- Accent pink: `#e90067`
- Accent orange: `#f45d00`
- Surface: `#ffffff`
- Border: `rgba(21, 33, 59, 0.14)`

## Shape and motion

- Cards use an 18px radius, form controls use 10px, and action buttons use a
  pill shape.
- Animate only opacity and transforms. Hero entry motion establishes hierarchy;
  hover and active states provide feedback.
- Every animation must collapse under `prefers-reduced-motion`.

## Interaction and accessibility

- Minimum 44px touch targets.
- Visible labels and focus states for every form control.
- Preserve content and form access from 320px upward with no horizontal overflow.
- Motion is limited to short hover/focus transitions and must respect reduced-motion preferences.
- Use SVG line icons, not emoji, for interface meaning.

## Content and SEO

- Say clearly that launch coverage, site access, and waitlist eligibility are limited to the United States.
- Use “being built” or “preparing to launch” for features that are not publicly released.
- Canonical URLs live on `https://chorezy.com`.
- Auth, reset, verification, and invitation compatibility routes are `noindex`.
- Legal pages are plain-language launch-waitlist notices, not substitutes for the final marketplace policies.
