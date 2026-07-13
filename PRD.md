# Slotwise — Product Requirements Document

**Status:** Draft for V1  
**Product name:** Slotwise  
**One-line description:** A polished scheduling workspace that lets independent professionals publish availability, accept appointments, and manage their calendar without back-and-forth messages.

## 1. Problem statement

Business professionals and freelancers often coordinate appointments through email, chat, and spreadsheets. The process is slow, creates timezone confusion, and makes double-bookings or missed confirmations more likely. Existing tools can also feel too complex or expensive for a solo operator.

Slotwise will give a professional one place to define when they are available, share a booking link, see upcoming appointments in a calendar, and automatically confirm bookings by email.

## 2. Target user profile

### Primary user: the host

- A business professional or freelancer, typically 25–50 years old.
- Examples: consultant, coach, designer, recruiter, accountant, photographer, or independent service provider.
- Manages their own schedule and usually offers one or a few appointment types.
- Comfortable with common web and calendar products but does not want complex setup.
- Primarily uses desktop for administration and mobile for quick checks.
- Values a professional client experience, reliable reminders, privacy, and timezone accuracy.

### Secondary user: the invitee

- A client or prospect who receives the host's booking link.
- Should be able to book from mobile or desktop without creating an account.
- Needs immediate, clear confirmation showing the appointment time in their own timezone.

## 3. Product goals

- Let a new host publish a usable booking page in under 10 minutes.
- Make open slots accurate across timezones and prevent double-bookings.
- Give hosts an at-a-glance calendar and simple appointment controls.
- Deliver a confirmation to both parties after every successful booking.

## 4. Core features for V1

### 4.1 Host account, profile, and appointment types

Hosts can sign in, set their public identity and timezone, and create appointment types with a name, duration, description, location/instructions, and active state.

**User stories**

- As a host, I want to create an account and set my name, booking-page slug, and timezone so clients see the correct professional details.
- As a host, I want to define a 30- or 60-minute appointment type so clients know what they are booking.
- As a host, I want to disable an appointment type without deleting its history so I can stop new bookings safely.

### 4.2 Availability management

Hosts can define recurring weekly availability and date-specific overrides such as time off or extra hours. Slot generation respects the appointment duration, host timezone, existing appointments, and a configurable minimum booking notice.

**User stories**

- As a host, I want to set different working hours for each weekday so booking options match my real schedule.
- As a host, I want to block a date or add exceptional hours so holidays and one-off schedule changes are represented.
- As a host, I want unavailable and already-booked times removed automatically so I cannot be double-booked.

### 4.3 Public booking flow

Each host has a shareable public URL. An invitee selects an active appointment type, date, and available time, then provides their name, email, and optional note. The booking is stored atomically and a success screen displays the final details.

**User stories**

- As an invitee, I want to see available times in my local timezone so I can choose confidently.
- As an invitee, I want to book without registering so scheduling has minimal friction.
- As an invitee, I want a clear success page after submission so I know the appointment was created.
- As a host, I want simultaneous attempts for the same time handled safely so only one booking succeeds.

### 4.4 Calendar and appointment management

The authenticated dashboard provides month, week, and agenda/list views. Hosts can inspect appointment details and cancel an upcoming appointment. Calendar data is the internal Slotwise schedule for V1.

**User stories**

- As a host, I want to switch between month, week, and agenda views so I can understand both workload and detail.
- As a host, I want to open an appointment and see the invitee, appointment type, time, and notes.
- As a host, I want to cancel an appointment with a reason so my availability reopens and the invitee is informed.

### 4.5 Transactional email confirmations

Slotwise sends branded confirmation emails to the host and invitee when a booking is created, and cancellation emails when a booking is cancelled. Messages include the appointment name, date, time, timezone, participants, location/instructions, and a plain-text fallback.

**User stories**

- As an invitee, I want an immediate confirmation email so I have a durable record of the booking.
- As a host, I want a confirmation email so I am alerted to a new appointment.
- As either party, I want cancellation email details so I do not attend an appointment that no longer exists.
- As the product owner, I want email delivery attempts logged and safely retryable so failures can be diagnosed without duplicate bookings.

## 5. Explicitly out of scope for V1

- Google Calendar, Microsoft Outlook, Apple Calendar, or CalDAV synchronization.
- Rescheduling by invitees; V1 supports cancellation followed by a new booking.
- Automated reminder sequences, SMS, WhatsApp, or push notifications.
- Payments, deposits, invoices, subscriptions, or marketplace discovery.
- Team scheduling, round-robin assignment, pooled availability, or organization roles.
- Multi-host appointments, group events, recurring appointments, or waitlists.
- Video-meeting link generation; hosts may provide a static location or meeting URL.
- Native iOS or Android apps.
- Custom domains, white-label themes, advanced analytics, or CRM integrations.
- Localization beyond English; timezone display is included, language translation is not.

## 6. Recommended tech stack

The stack favors a small team, fast delivery, low operational overhead, strong TypeScript coverage, and a clean path from prototype to production.

| Layer | Choice | Why it fits |
| --- | --- | --- |
| Web application | Next.js App Router + React + TypeScript | One deployable application for public pages, authenticated UI, and server-side booking logic. The [App Router](https://nextjs.org/docs/app) supports server and client components with file-based routing. |
| UI | Tailwind CSS + shadcn/ui | Fast, accessible component composition with full ownership of the resulting UI code. |
| Calendar UI | FullCalendar React, using the open-source day-grid and time-grid plugins | Mature month/week rendering and React integration. Keep premium resource/timeline features out of V1. See the [official React integration](https://fullcalendar.io/docs/react). |
| Forms and validation | React Hook Form + Zod | Typed validation shared between forms and server-side command boundaries. |
| Database | Supabase Postgres | Scheduling data is relational and benefits from transactions, indexes, constraints, and timezone-aware timestamps. Supabase provides a full [Postgres database](https://supabase.com/docs/guides/database/overview). |
| Authentication and authorization | Supabase Auth + Postgres Row Level Security | Email magic-link authentication keeps onboarding light; RLS isolates each host's private records. Supabase documents using [Auth with RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). |
| Data access | Supabase server client + SQL migrations/RPC functions | Reads remain simple while booking creation runs in a database transaction/function. Do not expose the service-role key to the browser. |
| Date/time handling | Native `Intl` + date-fns/date-fns-tz | Store instants as `timestamptz`, store each host's IANA timezone, and format only at system boundaries. |
| Email | Resend + React Email | TypeScript-friendly transactional templates and straightforward API delivery; the [email API](https://resend.com/docs/api-reference/emails/send-email) supports HTML, text, and React content. |
| Hosting | Vercel for the web app; Supabase managed database/auth | Minimal infrastructure work and good alignment with Next.js. Use separate preview, staging, and production environments. |
| Testing | Vitest + React Testing Library + Playwright | Unit coverage for slot generation, component coverage for key states, and browser-level coverage for booking and cancellation. |
| Quality and delivery | ESLint, Prettier, GitHub Actions, Sentry | Automated lint/type/test gates, consistent code, and production error visibility. |

### Architecture decisions

- Store all appointment boundaries as UTC-backed `timestamptz`; store IANA timezone names such as `Africa/Lagos`, never fixed numeric offsets.
- Generate candidate slots from weekly availability plus date overrides, then subtract active appointments before display.
- Enforce conflict prevention in Postgres, not only in the UI. Use an exclusion constraint or equivalent transactional function on host and time range so concurrent requests cannot create overlapping active appointments.
- Create the booking first, commit it atomically, then dispatch email. Persist an email event/outbox record with an idempotency key so delivery can be retried without creating another appointment.
- Apply RLS to all host-owned tables. Public booking reads and writes should go through narrowly scoped server endpoints/functions that return only information needed by invitees.
- Pin package versions in the lockfile and adopt the latest stable compatible releases during project setup rather than relying on floating versions in this document.

### Minimum data model

- `profiles`: host identity, unique public slug, IANA timezone, locale.
- `appointment_types`: host, name, description, duration, location/instructions, minimum notice, active state.
- `availability_rules`: host, weekday, local start/end time, effective dates.
- `availability_overrides`: host, local date, unavailable flag or replacement start/end times.
- `appointments`: host, appointment type snapshot, invitee details, UTC start/end, status, cancellation metadata, timestamps.
- `email_events`: appointment, message type, recipient, provider ID, idempotency key, status, attempts, timestamps.

Sensitive invitee fields must not be returned by public endpoints or exposed through anonymous database policies.

## 7. Definition of done

V1 is complete when all of the following are true:

- A host can authenticate by email, complete their profile, claim a unique valid slug, and create, edit, activate, or deactivate an appointment type.
- A host can set weekly availability and date overrides in their chosen IANA timezone.
- An unauthenticated invitee can open a public booking page, view only valid future slots in their local timezone, and create an appointment without an account.
- Appointment creation is atomic. Automated concurrency coverage proves that two requests cannot reserve the same or overlapping host time.
- The host can view appointments in month, week, and agenda/list modes and can open details or cancel a future appointment.
- Creating or cancelling a booking sends the correct host and invitee emails; provider failures are logged and retryable, and templates render in HTML and plain text.
- Cancelled time becomes bookable again when it still satisfies availability and minimum-notice rules.
- Authorization tests prove one host cannot read or mutate another host's private data, and public responses never expose private attendee records.
- Slot generation passes tests for daylight-saving transitions, half-hour and quarter-hour timezone offsets, overnight boundary rejection, minimum notice, overrides, and existing appointments.
- The primary booking and dashboard flows are usable at 320 px width and on current major desktop browsers; keyboard navigation, labels, focus states, contrast, and error messaging meet WCAG 2.2 AA expectations.
- Loading, empty, validation, email-failure, slot-no-longer-available, unauthorized, and not-found states have intentional UI.
- CI passes formatting, linting, TypeScript checks, unit/integration tests, database tests, and Playwright smoke tests.
- Production configuration includes separate secrets, verified sending domain, database backups, error monitoring, privacy policy, and a documented rollback procedure.
- No critical or high-severity defects remain open, and the end-to-end acceptance flow has been signed off in staging.

## 8. Proposed files

```text
slotwise/
├── README.md
├── PRD.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── prettier.config.mjs
├── .env.example
├── .github/
│   └── workflows/ci.yml
├── public/
│   └── brand/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/dashboard/
│   │   │   ├── calendar/page.tsx
│   │   │   ├── availability/page.tsx
│   │   │   ├── appointment-types/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── book/[slug]/
│   │   │   ├── page.tsx
│   │   │   └── confirmation/[appointmentId]/page.tsx
│   │   ├── api/
│   │   │   ├── bookings/route.ts
│   │   │   ├── appointments/[id]/cancel/route.ts
│   │   │   └── webhooks/resend/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── calendar/
│   │   ├── booking/
│   │   ├── availability/
│   │   └── ui/
│   ├── emails/
│   │   ├── booking-confirmed.tsx
│   │   └── booking-cancelled.tsx
│   ├── lib/
│   │   ├── appointments/
│   │   ├── availability/
│   │   │   ├── generate-slots.ts
│   │   │   └── generate-slots.test.ts
│   │   ├── email/
│   │   ├── supabase/
│   │   ├── time/
│   │   ├── env.ts
│   │   └── validation.ts
│   └── types/
│       └── database.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── 0003_booking_constraints.sql
│   ├── seed.sql
│   └── tests/
│       ├── booking_conflicts.sql
│       └── rls.sql
├── tests/
│   └── e2e/
│       ├── booking.spec.ts
│       └── cancellation.spec.ts
└── playwright.config.ts
```

The file map is an implementation target, not a requirement to create every file before its feature is started. Database migrations, tests, and `.env.example` should be committed; real secrets must never be committed.

## 9. Suggested V1 success metrics

- At least 70% of hosts who finish signup publish one active appointment type and availability schedule.
- Median time from signup to a bookable page is under 10 minutes.
- At least 90% of started booking flows result in a confirmed appointment, excluding slots lost to legitimate concurrency.
- Fewer than 0.5% of confirmed bookings require manual support because of time or timezone confusion.
- At least 99% of transactional confirmation attempts are accepted by the email provider within five minutes.


