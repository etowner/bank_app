import ChangeUsername from "./ChangeUsername";
import { changeUsername } from "../../../api/userApi";
import { getAxiosError } from "../../../api/axiosConfig";
import { render, screen } from "../../../lib/test-utils";
import userEvent from "@testing-library/user-event";

vi.mock("../../../api/userApi");
vi.mock("../../../api/axiosConfig");

const user = userEvent.setup();

const renderChangeUsername = () => {
  render(<ChangeUsername onClose={vi.fn()} onSuccess={vi.fn()} />);
};

describe("ChangeUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAxiosError).mockReturnValue("Test error message");
  });

  it("renders the ChangeUsername component with input and buttons", () => {
    renderChangeUsername();

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new username/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change username/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    expect(screen.queryByRole("alert", { name: /username changed successfully! please log in again with the new username./i })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert", { name: /test error message/i })).not.toBeInTheDocument();
  });

  describe("validation errors", () => {
    it("displays error when current password is empty", async () => {
      renderChangeUsername();

      await user.click(screen.getByRole("button", { name: /change username/i }));
      expect(await screen.findByText(/please enter your current password/i)).toBeInTheDocument();
    });

    it("displays error when new username is empty", async () => {
      renderChangeUsername();
      
      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.click(screen.getByRole("button", { name: /change username/i }));
      expect(await screen.findByText(/please enter a new username/i)).toBeInTheDocument();
    });

    it("displays error when new username is too short", async () => {
      renderChangeUsername();
      
      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText(/new username/i), "ab");
      await user.click(screen.getByRole("button", { name: /change username/i }));
      
      expect(await screen.findByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
    
    it("displays error when new username has invalid characters", async () => {
      renderChangeUsername();

      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText(/new username/i), "invalid username!");
      await user.click(screen.getByRole("button", { name: /change username/i }));
      
      expect(await screen.findByText(/username can only contain letters, numbers, underscores, and hyphens/i)).toBeInTheDocument();
    });
  });

  describe("changeUsername API", () => {
    it("successfully changes username when input is valid", async () => {
      vi.mocked(changeUsername).mockResolvedValueOnce(undefined);
      renderChangeUsername();

      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText(/new username/i), "newusername");
      await user.click(screen.getByRole("button", { name: /change username/i }));
      
      expect(changeUsername).toHaveBeenCalledWith("password123", "newusername");
      expect(await screen.findByRole('alert')).toHaveTextContent('Username changed successfully! Please log in again with your new username.');
    });

    it("displays error when changeUsername API fails", async () => {
      vi.mocked(changeUsername).mockRejectedValueOnce(new Error("API error"));
      renderChangeUsername();
      
      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText(/new username/i), "newusername");
      await user.click(screen.getByRole("button", { name: /change username/i }));

      expect(changeUsername).toHaveBeenCalledWith("password123", "newusername");
      expect(await screen.findByRole('alert')).toHaveTextContent('Test error message');
    });
  });
});
