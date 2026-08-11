import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import Header from "../components/Home/Header";
import { UserContext } from "../UserContext";
import React from "react";
describe("Header", () => {
  test("renders the bank app header with user profile manager", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { userID: "alice" } }}>
          <Header userID="alice" password="pwd123" />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Bank App")).toBeInTheDocument();
    expect(screen.getByText("Signed in as:")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "alice" })).toBeInTheDocument();
  });
});
