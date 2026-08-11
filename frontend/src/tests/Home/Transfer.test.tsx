import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Transfer from "../components/Transactions/Transfer";
import { UserContext } from "../UserContext";
import api from "../api/axiosConfig";
import React from "react";
vi.mock("../api/axiosConfig", () => ({
  default: {
    put: vi.fn(),
  },
}));

describe("Transfer", () => {
  test("shows an error for invalid transfer amounts", async () => {
    const user = userEvent.setup();
    const getUser = vi.fn();

    render(
      <MemoryRouter initialEntries={["/demo"]}>
        <UserContext.Provider value={{ getUser }}>
          <Transfer />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/invalid transfer amount/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });
});
