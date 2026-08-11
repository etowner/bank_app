import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi, beforeEach } from "vitest";
import Withdraw from "../components/Transactions/Withdraw";
import { UserContext } from "../UserContext";
import api from "../api/axiosConfig";
import React from "react";
vi.mock("../api/axiosConfig", () => ({
  default: {
    put: vi.fn(),
  },
}));

describe("Withdraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("submits a valid withdrawal that does not exceed balance", async () => {
    const user = userEvent.setup();
    const updateAccount = vi.fn();
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter initialEntries={["/demo/acc123"]}>
        <UserContext.Provider value={{ getUser: vi.fn() }}>
          <Withdraw
            userID="demo"
            accountID="acc123"
            balance={500}
            updateAccount={updateAccount}
          />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "250");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(api.put).toHaveBeenCalled();
    expect(updateAccount).toHaveBeenCalled();
  });

  test("shows an error when withdrawal exceeds balance", async () => {
    const user = userEvent.setup();
    const updateAccount = vi.fn();

    render(
      <MemoryRouter initialEntries={["/demo/acc123"]}>
        <UserContext.Provider value={{ getUser: vi.fn() }}>
          <Withdraw
            userID="demo"
            accountID="acc123"
            balance={100}
            updateAccount={updateAccount}
          />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "500");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  test("shows an error for invalid withdrawal amounts", async () => {
    const user = userEvent.setup();
    const updateAccount = vi.fn();

    render(
      <MemoryRouter initialEntries={["/demo/acc123"]}>
        <UserContext.Provider value={{ getUser: vi.fn() }}>
          <Withdraw
            userID="demo"
            accountID="acc123"
            balance={500}
            updateAccount={updateAccount}
          />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await user.type(screen.getByRole("textbox"), "-50");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/invalid withdrawal amount/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
});
