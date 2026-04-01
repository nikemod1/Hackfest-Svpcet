# APSAS Safety Platform

APSAS is a safety-focused project featuring a Command Center dashboard for real-time incident management and safety coordination.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd apsas-rnw-web
```

2. Install dependencies:
```bash
npm install
```

## Getting Started

### Running the Dashboard

Simply run:
```bash
npm run dashboard
```

This will automatically:
- Start the server on port 8000
- Open the dashboard in your default browser at http://localhost:8000/project.html

### Legacy Dashboard Details

This is the classic command-center UI and matches the original project style.

- File: project.html
- Tech: plain HTML, CSS, JS, MapLibre

Run it with a single command:

npm run dashboard

This will automatically start the server on port 8000 and open the dashboard in your browser.

Alternatively, run with any static server:

npx --yes http-server . -p 8000 -c-1

Then open:

http://localhost:8000/project.html

## Available Scripts

- `npm run dashboard` - Start Legacy Dashboard on http://localhost:8000 (opens automatically)
- `npm run sms-server` - Run local SMS backend
- `npm run lint` - Run linter

## Features

- Nagpur zone risk map with heat and zone layers
- Safe route planner and route comparison
- SOS simulation flow and contact panel
- Incident reporting and dashboard analytics
- Real location attempt with browser geolocation and IP fallback

## Troubleshooting

### Location is not using laptop location

- Browser location permission must be allowed for localhost
- If GPS is unavailable, fallback may use coarse IP location
- In Chrome, check Site settings for location permission

### Expo web startup errors

Common causes are dependency mismatch or incompatible Node runtime.

Try:

1. npm install
2. npx expo install --fix
3. Use Node 18 runtime command shown above

### Port already in use

Run Expo or static server on another port.

Example:

npx --yes http-server . -p 8001 -c-1

## Repository Structure

- project.html: legacy dashboard (original UI)
- App.tsx: React Native Web app entry
- App.js: alternate RN app entry and menu shell
- SosApp.js: SOS-specific RN screen
- src/safetyEngine.ts: routing, risk, and incident logic
- sms-server.js: backend SMS service endpoint
- android/: native Android module and package files

## Notes

- The legacy dashboard and Expo app are intentionally separate experiences.
- For demos of the original command-center interface, prefer project.html.
- For mobile/web app workflows in Expo, use npm run web or npm start.
