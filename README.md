# APSAS React Native Web

This workspace now contains a complete Expo (React Native + Web) website implementation.

## Run

1. Install dependencies

npm install

2. Start web app

npm run web

## Features Implemented

- Synthetic database with 40 initial crime incident entries
- Dynamic 4-zone risk map:
  - High (red)
  - Moderate (orange)
  - Adverse (yellow)
  - Safe (green)
- Road network rendering on map
- Dijkstra route planner for safest and fastest routes
- Route cards with time, distance, and risk level
- Recent incidents feed
- Incident reporting with severity and location updates
- Report history view
- SOS flow with emergency contacts and nearest police station targeting
- Dashboard with integer metrics, patrol priority percentages, and risk distribution

## Notes

- This app is built with React Native components and runs as a website through React Native Web.
- The map is drawn using an SVG road network and zone graph for deterministic route safety visualization.
