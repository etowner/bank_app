import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ProfileManager from "../components/ProfileManager/ProfileManager";
import { UserContext } from "../UserContext";
import api from "../api/axiosConfig";
import React from "react";
vi.mock("../api/axiosConfig", () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("ProfileManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    navigateMock.mockReset();
  });

  test("opens the profile panel and shows userID", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();

    render(
      <UserContext.Provider value={{ userID: "demo", logout: mockLogout }}>
        <ProfileManager />
      </UserContext.Provider>,
    );

    await user.click(screen.getByRole("link", { name: "demo" }));
    expect(
      await screen.findByRole("region", { hidden: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText(/UserID: demo/i)).toBeInTheDocument();
  });

  test("opens the profile panel and logs out", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();
    vi.mocked(api.post).mockResolvedValueOnce({});

    render(
      <UserContext.Provider value={{ userID: "demo", logout: mockLogout }}>
        <ProfileManager />
      </UserContext.Provider>,
    );

    await user.click(screen.getByRole("link", { name: "demo" }));
    expect(
      await screen.findByRole("region", { hidden: false }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Log Out" }));

    const logoutModal = await screen.findByText(
      "Are you sure you want to log out?",
    );
    const logoutButton = logoutModal
      .closest(".modal")
      .querySelector("button.btn-primary");
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  test("deletes the account and its related data", async () => {
    const user = userEvent.setup();
    const mockSetUser = vi.fn();
    const mockLogout = vi.fn();
    vi.mocked(api.delete).mockResolvedValue({});

    render(
      <UserContext.Provider
        value={{ userID: "demo", setUser: mockSetUser, logout: mockLogout }}
      >
        <ProfileManager />
      </UserContext.Provider>,
    );

    await user.click(screen.getByRole("link", { name: "demo" }));
    expect(
      await screen.findByRole("region", { hidden: false }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Account" }));
    await user.click(screen.getByRole("button", { name: /yes/i }));

    expect(api.delete).toHaveBeenCalledWith("/api/v1/account/closeAll");
    expect(api.delete).toHaveBeenCalledWith("/api/v1/user");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  test("shows Forgot Password button as placeholder", async () => {
    const user = userEvent.setup();

    render(
      <UserContext.Provider value={{ userID: "demo", logout: vi.fn() }}>
        <ProfileManager />
      </UserContext.Provider>,
    );

    await user.click(screen.getByRole("link", { name: "demo" }));
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
  });
});
