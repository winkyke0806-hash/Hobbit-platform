import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock firebase/app and firebase/database before importing the component
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [{}]),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(),
  set: vi.fn(),
  get: vi.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  onValue: vi.fn(() => () => {}),
  update: vi.fn(),
  push: vi.fn(() => ({ key: "mock" })),
  remove: vi.fn(),
  off: vi.fn(),
}));

describe("BoardGame (hobbit-game.jsx)", () => {
  it("renders without crashing", async () => {
    const { default: BoardGame } = await import("../hobbit-game.jsx");
    const { container } = render(<BoardGame />);
    expect(container).toBeTruthy();
  });
});
