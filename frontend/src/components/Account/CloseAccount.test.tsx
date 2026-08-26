import { deleteAccount } from "../../api/accountApi";
import {getAxiosError} from "../../api/axiosConfig";
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from '../../lib/test-utils';
import CloseAccount from "./CloseAccount";
import { useUserContext } from "../../context/UserContext";

vi.mock("../../api/accountApi");
vi.mock("../../api/axiosConfig");
vi.mock('../../context/UserContext');

const mockNavigate = vi.fn();
const user = userEvent.setup();

const mockUserContext = { 
    username: 'testuser', 
    user: { username: 'testuser', accounts: [], numOfAccounts: 0 }, 
    setUser: vi.fn(), fetchUser: vi.fn().mockResolvedValue({ username: 'testuser', accounts: [], numOfAccounts: 0 })
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ accountNumber: "1234567890" }) };
});

const renderCloseAccount = () => {

  render(
    <MemoryRouter>
      <CloseAccount />
    </MemoryRouter>
  );
};

describe("CloseAccount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useUserContext).mockReturnValue(mockUserContext);
        vi.mocked(getAxiosError).mockReturnValue('Test error message');
    });

    test("renders the CloseAccount component", () => {
        renderCloseAccount();
        expect(screen.getByRole("button", { name: /close account/i })).toBeInTheDocument();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("opens the modal when 'Close Account' button is clicked", async () => {
        renderCloseAccount();
        await user.click(screen.getByRole("button", { name: /close account/i }));
        expect(screen.getByText(/are you sure you want to delete this account\?/i)).toBeInTheDocument();
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
    });

    test("calls deleteAccount and navigates on confirmation", async () => {
        renderCloseAccount();
        await user.click(screen.getByRole("button", { name: /close account/i }));
        await user.click(screen.getByRole("button", { name: /yes/i }));

        await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith("1234567890"));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/home"));
        //await waitFor(() => expect(mockUserContext.fetchUser).toHaveBeenCalled());
    });

    test("displays an error message if deleteAccount fails", async () => {
        const errorMessage = "Failed to delete account";
        vi.mocked(deleteAccount).mockRejectedValueOnce(new Error(errorMessage));
        vi.mocked(getAxiosError).mockReturnValueOnce(errorMessage);

        renderCloseAccount();
        await user.click(screen.getByRole("button", { name: /close account/i }));
        await user.click(screen.getByRole("button", { name: /yes/i }));

        await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith("1234567890"));
        expect(await screen.findByRole("alert")).toHaveTextContent(errorMessage);
    });

})