import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import OpenAccount from "../components/Home/OpenAccount";
import React from "react";
describe("OpenAccount", () => {
  test("invokes the account opener for each account type", async () => {
    const user = userEvent.setup();
    const openAcc = vi.fn();
    const setError = vi.fn();

    render(<OpenAccount openAcc={openAcc} setError={setError} />);

    await user.click(
      screen.getByRole("button", { name: /open a new account/i }),
    );
    await user.click(screen.getByRole("button", { name: /checkings/i }));
    await user.click(
      screen.getByRole("button", { name: /open a new account/i }),
    );
    await user.click(screen.getByRole("button", { name: /savings/i }));

    expect(openAcc).toHaveBeenCalledWith("Checkings");
    expect(openAcc).toHaveBeenCalledWith("Savings");
    expect(setError).toHaveBeenCalledWith(null);
  });
});
