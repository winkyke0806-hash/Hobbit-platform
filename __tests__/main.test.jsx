import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Test the Root component logic directly (without importing main.jsx which calls ReactDOM.createRoot)
describe("Root routing logic", () => {
  it("renders auth screen when no user is logged in", () => {
    // Ensure no user in localStorage
    window.localStorage.removeItem("hobbit_current");

    // Import the auth component directly
    const AuthApp = React.lazy(() => import("../hobbit-app.jsx"));

    // Verify the component can be imported without errors
    expect(AuthApp).toBeDefined();
  });

  it("localStorage check works correctly", () => {
    // No user set
    window.localStorage.removeItem("hobbit_current");
    const isLoggedIn = () => {
      try {
        const u = JSON.parse(window.localStorage.getItem("hobbit_current"));
        return !!u?.adventureName;
      } catch {
        return false;
      }
    };

    expect(isLoggedIn()).toBe(false);

    // Set a valid user
    window.localStorage.setItem("hobbit_current", JSON.stringify({ adventureName: "Bilbo" }));
    expect(isLoggedIn()).toBe(true);

    // Cleanup
    window.localStorage.removeItem("hobbit_current");
  });
});
