# Tour Split Tracker

A full-stack Next.js application for tracking and splitting group tour expenses with a file-based JSON database and Next.js App Router API routes.

## Features

- **Trips Management**: Create, select, and manage multiple trips with dates and budgets.
- **Member Management**: Track trip participants with contact information.
- **Expense Tracking**: Log expenses across categories (Travel, Hotel, Food, Petrol, Shopping, etc.) with flexible split options (Equal, Custom, Percentage, Individual).
- **Advance Payments**: Record initial contributions and pre-trip advances per member.
- **Settlement & Debt Optimization**: Automatically calculate balances ("who owes whom") and generate detailed per-member final settlement breakdowns.
- **JSON File Database**: Zero-configuration local database storing data in human-readable JSON files in the `/data` folder (`trips.json`, `members.json`, `contributions.json`, `expenses.json`, `settings.json`).
- **Next.js API Routes**: Clean RESTful endpoints (`/api/[resource]`, `/api/[resource]/[id]`, `/api/import`) powering the frontend.
- **Full Backup & Restore**: One-click export to JSON file and instant restore from JSON backup file.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React icons
- **State Management**: Zustand
- **Database**: Local JSON File Database (`/data/*.json`)

## Getting Started

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```
