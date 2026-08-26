import ChangePassword from "./ChangePassword";
import { changePassword } from "../../../api/userApi";
import { getAxiosError } from "../../../api/axiosConfig";
import { render, screen } from "../../../lib/test-utils";
import userEvent from "@testing-library/user-event";

vi.mock("../../../api/userApi");
vi.mock("../../../api/axiosConfig");

const user = userEvent.setup();

const renderChangePassword = () => {
  render(<ChangePassword onClose={vi.fn()} onSuccess={vi.fn()} />);
};

describe("ChangePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAxiosError).mockReturnValue("Test error message");
  });
  
  it("renders the ChangePassword component with input and buttons", () => {
    renderChangePassword();

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    expect(screen.queryByRole("alert", { name: /password changed successfully!/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert", { name: /test error message/i })).not.toBeInTheDocument();
  });

  describe("validation errors", () => {
    it("displays error when current password is empty", async () => {
      renderChangePassword();

      await user.click(screen.getByRole("button", { name: /change password/i }));
      expect(await screen.findByText(/please enter your current password/i)).toBeInTheDocument();
    });

    it("displays error when new password is empty", async () => {
      renderChangePassword();
      
      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.click(screen.getByRole("button", { name: /change password/i }));
      expect(await screen.findByText(/please enter and confirm your new password/i)).toBeInTheDocument();
    });

    it("displays error when new password and confirm password do not match", async () => {
      renderChangePassword();
      
      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText("New Password"), "newpassword123");
      await user.type(screen.getByLabelText("Confirm New Password"), "differentpassword123");
      await user.click(screen.getByRole("button", { name: /change password/i }));
      
      expect(await screen.findByText(/new passwords do not match/i)).toBeInTheDocument();
    });

    it("displays error when current password and new password are the same", async () => {
      renderChangePassword();

      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText("New Password"), "password123");
      await user.type(screen.getByLabelText("Confirm New Password"), "password123");
      await user.click(screen.getByRole("button", { name: /change password/i }));
      
      expect(await screen.findByText(/new password cannot be the same as current password/i)).toBeInTheDocument();
    });

    it("displays error when new password is too short", async () => {
      renderChangePassword();
      
      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText("New Password"), "ab");
      await user.type(screen.getByLabelText("Confirm New Password"), "ab");
      await user.click(screen.getByRole("button", { name: /change password/i }));
      
      expect(await screen.findByText(/new password must be at least 3 characters/i)).toBeInTheDocument();
    });
    
   
  });

  describe("changePassword API", () => {
    it("successfully changes password when input is valid", async () => {
      vi.mocked(changePassword).mockResolvedValueOnce(undefined);
      renderChangePassword();

      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText("New Password"), "newpassword123");
      await user.type(screen.getByLabelText("Confirm New Password"), "newpassword123");
      await user.click(screen.getByRole("button", { name: /change password/i }));
      
      expect(changePassword).toHaveBeenCalledWith("password123", "newpassword123");
      expect(await screen.findByRole('alert')).toHaveTextContent('Password changed successfully!');
    });

    it("displays error when changePassword API fails", async () => {
      vi.mocked(changePassword).mockRejectedValueOnce(new Error("API error"));
      renderChangePassword();

      await user.type(screen.getByLabelText(/current password/i), "password123");
      await user.type(screen.getByLabelText("New Password"), "newpassword123");
      await user.type(screen.getByLabelText("Confirm New Password"), "newpassword123");
      await user.click(screen.getByRole("button", { name: /change password/i }));

      expect(changePassword).toHaveBeenCalledWith("password123", "newpassword123");
      expect(await screen.findByRole('alert')).toHaveTextContent('Test error message');
    });
  });

});