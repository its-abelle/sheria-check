# Contributing to Sheria Check

## Code Standards — Highest Rigor

All code must pass these checks before merging. No exceptions.

---

## TypeScript

- **Strict mode required.** `tsconfig.json` has `"strict": true`. This is non-negotiable.
- **No `any`.** Use `unknown` if the type is truly not known, then narrow with type guards.
- **No `// @ts-ignore` or `// @ts-expect-error`.** If TypeScript flags an error, fix it properly.
- **Explicit return types on all functions.** Do not rely on inference for public APIs.
- **Imports are ordered:** built-in → external → internal → relative, with a blank line between groups.
- **No unused variables or parameters.** `noUnusedLocals` and `noUnusedParameters` are enabled.

### Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| Files (React) | PascalCase | `OffenseCard.tsx` |
| Files (utility) | camelCase | `format.ts` |
| Components | PascalCase | `export function SearchBar()` |
| Hooks | camelCase, `use` prefix | `useSearch` |
| Functions | camelCase | `formatKES()` |
| Interfaces | PascalCase | `interface OffenseProps` |
| Types | PascalCase | `type Severity = 'minor' | 'serious'` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |
| SQL columns | snake_case | `min_fine`, `course_of_action` |

---

## React (Native / Expo)

- **Functional components only.** No class components (except `ErrorBoundary` which requires lifecycle methods).
- **One component per file.** The file name must match the component name.
- **Props interfaces defined above the component** in the same file, exported if used elsewhere.
- **Custom hooks** encapsulate state + side effects. Components do not contain raw `useEffect` or `useState` for complex logic.
- **No inline styles.** Use NativeWind (Tailwind) classes only.
- **No default exports** — prefer named exports for all components and functions.

### Component Template

```tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onPress: () => void;
}

export function Button({ label, variant = "primary", onPress }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "rounded-lg px-4 py-2",
        variant === "primary" && "bg-primary-500",
        variant === "secondary" && "border border-gray-200"
      )}
    >
      <Text className="text-sm font-medium text-white">{label}</Text>
    </TouchableOpacity>
  );
}
```

---

## Tailwind / CSS

- **Utility-first.** No custom CSS files. No CSS modules. No styled-components.
- **Use the `cn()` utility** (wraps `clsx`) for conditional class merging.
- **Colors are limited to the palette** in `tailwind.config.js`: `primary-50..900`, `caution-50..600`, `gray-50..900`, `white`, `black`.
- **Responsive design** uses Tailwind breakpoints: `sm:`, `md:`, `lg:`.
- **Dark mode is not a current goal** — optimize for readability in bright Kenyan sunlight.
- **Touch targets must be >= 44px** on mobile (accessibility requirement).

---

## API Design

- **Versioned routes.** All endpoints under `/api/v1/`.
- **Consistent response shape.**
  - Success: `{ data: T, pagination?: { cursor, limit, has_more, total } }`
  - Error: `{ error: string, details?: any }`
- **Zod validation on every POST/PUT.** Schema defined at the top of the controller.
- **Status codes.**
  - 200: Success (GET)
  - 201: Created (POST)
  - 400: Validation error
  - 401: Unauthorized (admin)
  - 404: Not found
  - 429: Rate limited
  - 500: Internal error (never leak stack traces)
- **Search uses cursor-based pagination** (not offset-based) for consistency.

---

## Database

- **All queries use parameterized statements** (`$1`, `$2`). Never interpolate values into SQL strings.
- **Migrations are additive only.** Never modify a committed migration. Create a new one.
- **Index queries.** Every `WHERE`, `ORDER BY`, and `JOIN` column should have an index.
- **Full-text search** uses PostgreSQL `to_tsvector` + `plainto_tsquery` with a GIN index.
- **Connection pool** size configured via env var (`PG_POOL_SIZE`, default 20).

---

## Error Handling

- **Every API call in the frontend must handle:**
  1. Network failure (no internet)
  2. Server error (5xx)
  3. Validation error (4xx)
  4. Empty/not-found (200 with no data)
- **Error boundaries** at the route level in React.
- **User-visible errors must be human-readable.** No "Error 500". Instead: "Something went wrong. Please try again. If this persists, contact us."
- **Server errors** are logged via pino. Stack traces are never returned to the client.

---

## Testing

- **Unit tests required for:**
  - All utility functions
  - All hooks
  - All controllers
  - Edge cases (empty input, special characters, max lengths)
- **Integration tests for:**
  - Search endpoint (query variations, edge cases)
  - Report submission (valid/invalid payloads)
- **Test naming:** `describe('ComponentName')` / `it('does x when y')` in plain English.
- **Minimum coverage:** 80% for utilities, 60% for components.

---

## Accessibility (Required)

- **All interactive elements must be keyboard accessible.** Test with Tab navigation.
- **All images must have `alt` text.** Decorative icons need `aria-hidden="true"`.
- **Color contrast must meet WCAG 2.1 AA:** 4.5:1 for normal text, 3:1 for large text.
- **Focus indicators must be visible.** Never `outline: none` without a replacement.
- **Forms must have labels.** Use `<label>` or `aria-label`.
- **Modals must trap focus and support Escape to close.**
- **Skip-to-content link** on every page.

---

## PR Review Checklist

Every PR is reviewed against these criteria:

- [ ] TypeScript compiles with no errors (`tsc --noEmit`)
- [ ] No `any`, no `@ts-ignore`, no `@ts-expect-error`
- [ ] All new components have prop interfaces with proper types
- [ ] Tailwind classes use the theme palette (no arbitrary values)
- [ ] All API calls have error handling
- [ ] All forms validate input (client + server)
- [ ] Accessibility: keyboard nav, ARIA labels, focus management
- [ ] Mobile responsive (tested at 375px width)
- [ ] Offline behavior considered (does it degrade gracefully?)
- [ ] No secrets, tokens, or `.env` committed
- [ ] Database queries are parameterized
- [ ] New dependencies are justified and audited
- [ ] Bundle size impact documented for frontend changes
- [ ] Tests added for new functionality

---

## Commit Messages

```
type(scope): short description (max 72 chars)

- Bullet point details if needed
- References issue or PR number
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`

Examples:
```
feat(server): add pagination to offense search
fix(client): correct fine range formatting for values > 9999
docs(roadmap): add phase 5 monetization details
chore(deps): upgrade express to 4.21.0
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### 1. Start PostgreSQL

```bash
docker compose up db -d
```

### 2. Start the Server

```bash
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

### 3. Start the Expo App

```bash
cd client
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.

Set `EXPO_PUBLIC_API_URL` in `client/.env` to your machine's LAN IP for device testing:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api/v1
```
