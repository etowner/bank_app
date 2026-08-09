import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import App from "../App";
import React from "react";
describe("App routing", () => {
  test("renders the front page on the root route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /bank application/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /log in/i })).toBeInTheDocument();
  });
});
