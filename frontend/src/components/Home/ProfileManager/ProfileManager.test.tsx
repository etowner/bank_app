import { render, screen } from '../../../lib/test-utils';
import userEvent from "@testing-library/user-event";
import { deleteUser, logoutUser } from "../../../api/userApi";
import { deleteAllAccounts } from "../../../api/accountApi";
import { useUserContext } from "../../../context/UserContext";
import { MemoryRouter } from "react-router-dom";
import ProfileManager from "./ProfileManager";
import { getAxiosError } from '../../../api/axiosConfig';

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockUserContext = {
  username: "demo",
  user: { username: "demo", accounts: [], numOfAccounts: 0 },
  setUser: vi.fn(),
  fetchUser: vi.fn(),
};

vi.mock('../../../context/UserContext');
vi.mock("../../../api/userApi");
vi.mock("../../../api/accountApi");
vi.mock("../../../api/axiosConfig");

const user = userEvent.setup();

const renderOffcanvas = async () => {
  render(
    <MemoryRouter>
      <ProfileManager />
    </MemoryRouter>
  );

  await user.click(screen.getByRole("link", { name: "demo" }));
  expect(await screen.findByRole("dialog", { hidden: false }),).toBeInTheDocument();
}

describe("ProfileManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAxiosError).mockReturnValue('Test error message');
    vi.mocked(useUserContext).mockReturnValue(mockUserContext);
  });


  test("initial render with username link", () => {
    render(
      <MemoryRouter>
        <ProfileManager />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "demo" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("opens the profile panel and shows username", async () => {

    await renderOffcanvas();

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText(/Username:/i)).toBeInTheDocument();
  });

  test("logs out", async () => {
    vi.mocked(logoutUser).mockResolvedValueOnce(undefined);
    
    await renderOffcanvas();

    await user.click(screen.getByRole("button", { name: "Log Out" }));
    expect(await screen.findByText("Are you sure you want to log out?",),).toBeInTheDocument();
    
    const logoutButton = screen.getByRole("button", { name: "Yes" });
    await user.click(logoutButton);

    expect(logoutUser).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  test.skip("clicking on change username modal shows change username form", async () => {
    await renderOffcanvas();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /change username/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  test.skip("clicking on change password modal shows change password form", async () => {
    await renderOffcanvas();
    await user.click(screen.getByRole("button", { name: "Change Password" }));
    expect(await screen.findByText("Change Password"),).toBeInTheDocument();
  });

  test("deletes the account and its related data", async () => {
    vi.mocked(deleteAllAccounts).mockResolvedValueOnce(undefined);
    vi.mocked(deleteUser).mockResolvedValueOnce(undefined);
    
    await renderOffcanvas();
    await user.click(screen.getByRole("button", { name: "Delete Account" }));
    await user.click(screen.getByRole("button", { name: /yes/i }));

    expect(deleteUser).toHaveBeenCalled();
    expect(deleteAllAccounts).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
