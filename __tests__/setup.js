import "@testing-library/jest-dom";

// Mock canvas — hobbit-app.jsx uses canvas for particle effects
HTMLCanvasElement.prototype.getContext = function () {
  return {
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    measureText: () => ({ width: 0 }),
    canvas: this,
  };
};

// Mock Firebase — hobbit-game.jsx initializes Firebase and exposes it on window.__fbDB
// We mock it globally so components can render without a real Firebase connection.
window.__fbDB = {
  getDatabase: () => ({}),
  ref: () => ({}),
  set: () => Promise.resolve(),
  get: () => Promise.resolve({ exists: () => false, val: () => null }),
  onValue: () => () => {},
  update: () => Promise.resolve(),
  push: () => ({ key: "mock-key" }),
  remove: () => Promise.resolve(),
  off: () => {},
};

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });
