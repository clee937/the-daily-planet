import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { HomePage } from "../../src/pages/Home/HomePage";

describe("Home Page", () => {
  beforeEach(() => {
    // fake localstorage for tokens needed a jsdom doesnt provide one by default
    const store = {};
    globalThis.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value; },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    };
  });
  test("welcomes you to the site", () => {
    // We need the Browser Router so that the Link elements load correctly
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const heading = screen.getByRole("heading");
    expect(heading.textContent).toEqual("Welcome to The Daily Planet!");
  });

  test("Renders the chatbot", async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

      expect(screen.getByPlaceholderText("Ask Rover about space...")).toBeTruthy();
      expect(screen.getByRole("button", { name: /send/i })).toBeTruthy();
  });
});
