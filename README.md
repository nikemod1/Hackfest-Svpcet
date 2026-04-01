# APSAS Safety Platform

> 🚀 A real-time Command Center dashboard for incident management and safety coordination

APSAS provides a dynamic, map-based interface for monitoring safety zones, planning safe routes, and coordinating emergency response in real-time.

---

## Quick Start ⚡

Get up and running in just 2 steps:

```bash
npm install
npm run dashboard
```

That's it! The dashboard will open automatically at `http://localhost:8000/project.html` (and `http://localhost:8000` redirects there)

---

## Installation

### What You Need

- **Node.js** v16 or higher ([download here](https://nodejs.org/))
- **npm** (comes automatically with Node.js)

### How to Set Up

**Step 1:** Clone the repository
```bash
git clone <repository-url>
cd apsas-rnw-web
```

**Step 2:** Install dependencies
```bash
npm install
```

**Step 3:** Start the dashboard
```bash
npm run dashboard
```

✅ Your dashboard is now running on `http://localhost:8000/project.html`


## Available Commands

| Command | What it does |
|---------|------------|
| `npm run dashboard` | 🎯 **Start here!** Launches the Command Center dashboard |
| `npm run sms-server` | 📱 Runs the SMS backend service |
| `npm run lint` | 🔍 Checks code for quality issues |

---

## Key Features

✨ **What you can do:**

- 📍 **Real-time Zone Map** - View Nagpur zones with live risk heat mapping
- 🗺️ **Route Planner** - Compare safe routes and get recommendations
- 🆘 **SOS Management** - Simulate and manage emergency calls
- 📊 **Dashboard Analytics** - Track incidents and safety metrics  
- 🌍 **Smart Location Detection** - GPS + IP-based location fallback

---

## Troubleshooting 🔧

### ❓ "Dashboard won't start" or port is in use

**Solution:** The port 8000 is already being used. Run on a different port:
```bash
npx --yes http-server . -p 8001 -c-1
```
Then open `http://localhost:8001/project.html`

### ❓ Location is showing as incorrect

**Why this happens:** Your browser hasn't granted location permission

**How to fix:**
1. Open the dashboard
2. Allow location access when your browser asks
3. GPS will be used if available, otherwise IP-based location will be used

### ❓ Something seems broken after an update

**Try these steps in order:**
```bash
npm install
npm run lint
npm run dashboard
```

---

## Project Structure 📁

```
apsas-rnw-web/
├── project.html           → The main Command Center dashboard
├── sms-server.js          → SMS backend service
├── src/
│   └── safetyEngine.ts    → Route & incident logic
├── android/               → Native Android components
└── package.json           → Project dependencies
```

---

## Need Help? 💬

- Check the [troubleshooting section](#troubleshooting-) above
- Make sure Node.js v16+ is installed: `node --version`
- Check port 8000 is available: `netstat -an | findstr :8000`

---
