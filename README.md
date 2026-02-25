# cfetch

`cfetch` is a Next.js app that visualizes Codeforces performance for a handle with an analytics dashboard.

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Recharts
- EvilCharts

## Local Development

Install dependencies:

```bash
bun install
```

Start dev server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).


## Project Structure

- `app/page.tsx`: Landing page (handle input)
- `app/[handle]/page.tsx`: Analytics route for a user handle
- `components/analytics-dashboard.tsx`: Main dashboard layout and charts
- `components/ui/*`: Reusable UI and chart primitives
- `lib/codeforces.ts`: Data fetching and processing utilities
