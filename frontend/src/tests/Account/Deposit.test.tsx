import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi, beforeEach } from "vitest";
import Deposit from "../components/Transactions/Deposit";
import { UserContext } from "../UserContext";
import api from "../api/axiosConfig";
import React from "react";
vi.mock("../api/axiosConfig", () => ({
  default: {
    put: vi.fn(),
  },
}));

describe("Deposit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("submits a valid deposit amount", async () => {
    const user = userEvent.setup();
    const updateAccount = vi.fn();
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter initialEntries={["/demo/acc123"]}>
        <UserContext.Provider value={{ getUser: vi.fn() }}>
          <Deposit
            userID="demo"
            accountID="acc123"
            updateAccount={updateAccount}
          />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "100.50");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(api.put).toHaveBeenCalled();
    expect(updateAccount).toHaveBeenCalled();
  });

  test("shows an error for invalid deposit amounts", async () => {
    const user = userEvent.setup();
    const updateAccount = vi.fn();

    render(
      <MemoryRouter initialEntries={["/demo/acc123"]}>
        <UserContext.Provider value={{ getUser: vi.fn() }}>
          <Deposit
            userID="demo"
            accountID="acc123"
            updateAccount={updateAccount}
          />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "-50");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/invalid deposit amount/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
});
