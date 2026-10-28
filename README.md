# Shiv Kumar — Portfolio

> **Systems & Backend Engineering · Cloud Infrastructure · Distributed Architecture**  
> Interactive celestial portfolio featuring procedural 60fps canvas engines, real-time Level-2 market microstructure simulations, orbital mechanics, audio feedback, and dark/light cosmological themes.

🌐 **Live Demo:** [portfolio-shivkumar.vercel.app](https://portfolio-shivkumar.vercel.app) *(or your deployed Vercel URL)*

---

## ✦ Overview

Designed and built as an editorial, high-performance portfolio showcasing production systems, distributed backends, and cloud infrastructure projects:

* **Flagship Work Showcases**:
  * **Shadow Exchange** — Simulated institutional equities exchange and dark market terminal with sub-millisecond in-memory FIFO matching, hidden liquidity crossing, and live STOMP WebSockets.
  * **Astra** — Autonomous spacecraft trajectory optimization engine using continuous-thrust Pontryagin Maximum Principle (PMP) collocation.
* **Procedural Canvas Engines**:
  * 60fps celestial starfield, ambient drifting auroras, and planetary bodies with responsive parallax and scroll blur.
  * Interactive Level-2 order book depth ladders and Keplerian orbital vector fields.
  * Interactive **Pink Planet Mascot** with spring physics, sunglasses specular glints, and audio feedback.
* **Responsive Architecture**:
  * Fluid typography scaling with Google Fonts (`Fraunces`, `Instrument Sans`, `Spline Sans Mono`).
  * Custom 404 error portal with interactive space navigation.
  * Zero-dependency client-side architecture with Vite bundling under 400ms.

---

## 🛠️ Tech Stack

* **Core**: Vanilla JavaScript (ES2023+), HTML5 Canvas, Web Audio API
* **Styling**: Modern CSS Design Tokens, CSS Custom Properties, Fluid `clamp()` Typography
* **Tooling & Build**: [Vite](https://vitejs.dev/)
* **Typography**: Fraunces, Instrument Sans, Spline Sans Mono
* **Deployment**: [Vercel](https://vercel.com)

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/shivkumar077/portfolio.git

# Enter project directory
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be live at `http://localhost:5173/`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
portfolio/
├── 404.html               # Custom interactive 404 space portal
├── index.html             # Main portfolio entry & semantic structure
├── package.json           # Scripts & Vite build dependencies
├── vercel.json            # Deployment routing & 404 configuration
├── vite.config.js         # Multi-page Rollup bundle config
├── public/
│   ├── favicon.svg        # Official Pink Mascot favicon
│   └── assets/            # Audio chimes, icons & static assets
└── src/
    ├── styles.css         # Design system, CSS variables & fluid typography
    ├── main.js            # App coordinator, routing & interactive state
    ├── canvas/            # 60fps procedural canvas engines
    │   ├── background.js  # Celestial sky, stars, auroras & drifting planets
    │   ├── coordinate-field.js # Interactive mouse tracking coordinate grid
    │   └── previews.js    # Order book simulations & Keplerian orbit renderers
    ├── components/        # Modular UI components
    │   ├── hero-mascot.js # Interactive Hero Mascot with physics
    │   ├── case-study-modal.js # Fullscreen work deep dives & telemetry
    │   ├── command-palette.js  # ⌘K instant search & navigation
    │   └── floating-work-preview.js # Cursor magnetic preview tiles
    └── data/              # Structured JSON project & career records
```

---

## 📬 Connect

* **Website**: [Live Deployment](https://portfolio-shivkumar.vercel.app)
* **LinkedIn**: [linkedin.com/in/shiv-kumar-399a32231](https://www.linkedin.com/in/shiv-kumar-399a32231/)
* **GitHub**: [@shivkumar077](https://github.com/shivkumar077)
* **X**: [@nightcore_077](https://x.com/nightcore_077)
* **Email**: [shivkumar6990655@gmail.com](mailto:shivkumar6990655@gmail.com)

---

© 2026 Shiv Kumar. Engineered with precision.
