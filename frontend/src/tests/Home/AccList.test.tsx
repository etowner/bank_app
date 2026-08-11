import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import AccList from "../components/Home/AccList";

describe("AccList", () => {
  test("renders the list of user accounts with View buttons", () => {
    const mockAccList = [
      { accountID: "acc1", type: "Savings", balance: 1000 },
      { accountID: "acc2", type: "Checkings", balance: 2500 },
    ];

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AccList userID="demo" accList={mockAccList} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /accounts/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/savings.*acc1/i)).toBeInTheDocument();
    expect(screen.getByText(/checkings.*acc2/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /view/i })).toHaveLength(2);
  });

  test("renders balance and account type for each account", () => {
    const mockAccList = [{ accountID: "acc1", type: "Savings", balance: 1000 }];

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AccList userID="demo" accList={mockAccList} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/savings/i)).toBeInTheDocument();
  });
});
