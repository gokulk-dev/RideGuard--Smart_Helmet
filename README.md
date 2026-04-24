# 🪖 RideGuard — Smart Helmet

A mobile-first web app that serves as the companion interface for a smart crash-detection helmet. RideGuard connects riders and their family guardians in real time — detecting accidents, triggering SOS alerts, and sharing live GPS location.

---

## 📱 Features

### Rider View
- **Dashboard** — Helmet wear status, battery level, solar charging indicator, GSM signal strength, and a live safety score
- **Live Tracking** — GPS-based location tracking with an embedded OpenStreetMap view, speed, latitude, and longitude display; start/stop trip recording
- **SOS Emergency** — One-tap SOS button with a 10-second countdown and automatic cancellation option
- **Emergency Contacts** — Add, edit, and manage up to 3 contacts who receive SMS alerts with live location on crash detection
- **Incident History** — Filterable log of crash events, false alarms, and hard brakes (this week / this month / all time)
- **Settings** — Paired helmet info, firmware version, crash sensitivity (Low / Medium / High), alert delay (5s / 10s / 15s), SOS message template, and notification preferences

### Guardian View
- **Guardian Dashboard** — See the paired rider's helmet status, last-seen time, current speed, and battery
- **Live Rider Location** — Embedded map showing the rider's real-time GPS position
- **Recent Alerts** — Feed of the latest crash detections and false alarms from the rider

### Login & Pairing
- Phone number + helmet code authentication
- Role selection (Rider or Guardian)
- Simulated BLE helmet pairing flow

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom design system, no framework) |
| Logic | Vanilla JavaScript (ES5-compatible) |
| Maps | OpenStreetMap embed (iframe) |
| Fonts | Google Fonts — Syne & Inter |

No build tools, no dependencies, no bundler — open `index.html` and go.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/gokulk-dev/RideGuard--Smart_Helmet.git
cd RideGuard--Smart_Helmet

# Open the app in your browser
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or simply drag `index.html` into any modern browser.

---

## 📂 Project Structure

```
RideGuard--Smart_Helmet/
├── index.html   # All screens and UI markup
├── style.css    # Design system, components, and layout
└── script.js    # App logic — login, navigation, SOS, tracking, contacts
```

---

## 🔮 Hardware Context

RideGuard is designed to pair with an ESP32-based smart helmet (`RideGuard-ESP32-A1B2`) that provides:
- **Accelerometer / G-force sensor** for crash detection
- **GPS module** for real-time location
- **GSM module** for SMS SOS alerts
- **Solar charging** for extended battery life
- **BLE** for smartphone pairing

This repository contains the companion web app UI only. Hardware firmware is separate.

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
