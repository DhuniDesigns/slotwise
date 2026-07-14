# Slotwise Development Instructions

## Product

- Slotwise is an appointment-scheduling SaaS platform.
- Read PRD.md and README.md before making major product changes.
- Continue improving the existing implementation. Do not rebuild the project from scratch.
- Preserve working routes, booking logic, mock data, forms, and interactions.

## Design direction

- Use a premium, minimal, monochrome interface.
- Use black, white, and neutral grey as the primary palette.
- Use Linear for interface hierarchy and restraint.
- Use Cal.com for scheduling UX patterns.
- Use Vercel Geist for component and typography inspiration.
- Do not directly copy logos, branding, text, or proprietary assets.
- Avoid decorative gradients, excessive shadows, glassmorphism, random colours, and unnecessary animations.
- Use the frontend-design skill whenever making major frontend or UI changes.

## Implementation

- Directly edit the repository instead of only explaining code.
- Reuse existing components and architecture.
- Prefer shared design tokens and reusable components over one-off styling.
- Use realistic mock data when Supabase credentials are unavailable.
- Do not leave TODO sections, blank pages, placeholder interfaces, or inactive buttons.
- Preserve accessibility, keyboard navigation, and visible focus states.

## Responsive requirements

Test the interface at:

- 1440px desktop
- 1024px laptop
- 768px tablet
- 390px mobile

Fix overflow, clipping, cramped layouts, and inconsistent spacing.

## Validation

Before marking a development task complete:

1. Run npm run typecheck.
2. Run npm run lint.
3. Run npm test.
4. Run npm run build.
5. Start the application with npm run dev.
6. Open the application in the browser.
7. Visually inspect the affected routes.
8. Test all modified buttons, forms, navigation, and responsive states.
9. Fix runtime errors and browser console errors.

## Definition of done

A task is complete only when:

- The requested feature is implemented in the repository.
- The interface renders successfully.
- Existing functionality remains working.
- Desktop and mobile layouts have been inspected.
- Validation commands pass.
- There are no visibly unfinished sections.
