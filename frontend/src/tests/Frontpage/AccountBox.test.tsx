import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import AccountBox from "../../components/FrontPage/AccountBox";
import { UserContext } from "../../src/auth/UserContext";
import React from "react";
describe("AccountBox", () => {
  test("submits register and login credentials from the form", async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    const register = vi.fn();

    render(
      <UserContext.Provider value={{ login, register, error: null }}>
        <AccountBox />
      </UserContext.Provider>,
    );

    // Get textbox (userID) and password inputs
    const textboxes = screen.getAllByRole("textbox");
    const passwordElements = document.querySelectorAll(
      'input[type="password"]',
    );

    // Fill create account form
    await user.type(textboxes[0], "demo");
    await user.type(passwordElements[0], "secret");
    await user.click(screen.getAllByRole("button", { name: "Submit" })[0]);

    expect(register).toHaveBeenCalledWith("demo", "secret");

    // Switch to login tab and fill login form
    await user.click(screen.getByRole("tab", { name: /log in/i }));

    // Clear and fill the login form inputs
    await user.clear(textboxes[0]);
    await user.clear(passwordElements[0]);
    await user.type(textboxes[0], "demo2");
    await user.type(passwordElements[0], "secret2");
    await user.click(screen.getAllByRole("button", { name: "Submit" })[1]);

    expect(login).toHaveBeenCalledWith("demo2", "secret2");
  });
});
