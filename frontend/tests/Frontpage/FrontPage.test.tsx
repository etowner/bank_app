import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import FrontPage from "../components/FrontPage/FrontPage";
import { UserContext } from "../UserContext";
import React from "react";
describe("FrontPage", () => {
  test("renders the bank application welcome header and account box", () => {
    render(
      <UserContext.Provider
        value={{ user: {}, login: () => {}, register: () => {}, error: null }}
      >
        <FrontPage />
      </UserContext.Provider>,
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
