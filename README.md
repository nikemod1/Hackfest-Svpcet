# APSAS Safety Platform

APSAS is a safety-focused project with two web experiences in the same repository:

1. Legacy Command Center dashboard (MapLibre static HTML)
2. Expo React Native Web application

Both can be run locally, depending on which interface you want.

## Project Modes

### 1) Legacy Dashboard (original look)

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

### 2) Expo App (React Native Web)

This is the Expo-based app entrypoint.

- Main files: App.tsx, App.js, SosApp.js
- Tech: Expo SDK 52, React Native Web

Install and run:

npm install
npm run web

If your system Node version is too new and Expo fails to boot, run with Node 18:

Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue; npx -y node@18.20.4 ./node_modules/expo/bin/cli start --web

## Available Scripts

- npm run dashboard: start Legacy Dashboard on http://localhost:8000 (opens in browser automatically)
- npm start: start Expo
- npm run web: start Expo web
- npm run android: start Expo for Android
- npm run ios: start Expo for iOS
- npm run sms-server: run local SMS backend
- npm run lint: run linter

## Features

### Legacy Dashboard (project.html)

- Nagpur zone risk map with heat and zone layers
- Safe route planner and route comparison
- SOS simulation flow and contact panel
- Incident reporting and dashboard analytics
- Real location attempt with browser geolocation and IP fallback

### Expo App

- React Native UI for SOS and safety workflows
- Zone and route logic via src/safetyEngine.ts
- Incident generation, reporting, and dashboard views

## Troubleshooting

### App does not look like the old dashboard

- npm run web launches the Expo app, not project.html
- Use the static server flow and open /project.html for the old interface

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
