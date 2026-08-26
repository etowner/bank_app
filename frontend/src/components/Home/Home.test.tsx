import Home from "./Home";
import { useUserContext } from "../../context/UserContext";
import { render, screen, waitFor } from '../../lib/test-utils';
import { createAccount } from "../../api/accountApi";
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUserContext = { 
    username: 'testuser', 
    user: { username: 'testuser', accounts: [], numOfAccounts: 0 }, 
    setUser: vi.fn(), fetchUser: vi.fn().mockResolvedValue({ username: 'testuser', accounts: [], numOfAccounts: 0 })
};

vi.mock('../../context/UserContext');
vi.mock('../../api/accountApi');

vi.mock('./PieChart', () => ({
  default: () => <div data-testid="pie-chart">Mocked PieChart</div>,
}));

vi.mock("./Header",() => ({
  default: () => <div data-testid="header">Mocked Header</div>,
}));

vi.mock("./AccountList.tsx", () => ({
  default: () => <div data-testid="account-list">Mocked AccountList</div>,
}));

vi.mock("./Transfer.tsx", () => ({
  default: () => <div data-testid="transfer">Mocked Transfer</div>,
}));


describe("Home", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("initial render", () => {

        it("renders Home component with user context", async () => {
            vi.mocked(useUserContext).mockReturnValue(mockUserContext);
            const {fetchUser } = useUserContext();
            
            render(<MemoryRouter><Home /></MemoryRouter>);
            
            await waitFor(() => expect(fetchUser).toHaveBeenCalled());
            expect(screen.getByText(/Welcome testuser/i)).toBeInTheDocument();
        });

        it('renders each subcomponent', () => {
            vi.mocked(useUserContext).mockReturnValue(mockUserContext);
            render(<MemoryRouter><Home /></MemoryRouter>);
            
            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("account-list")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /open a new account/i })).toBeInTheDocument();
            expect(screen.getByTestId("transfer")).toBeInTheDocument();
            expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();

        });
    });

    describe("openAcc function", () => {
        test("Open account button calls createAccount API", async () => {
            vi.mocked(useUserContext).mockReturnValue(mockUserContext);
            render(<MemoryRouter><Home /></MemoryRouter>);
            
            await userEvent.click(screen.getByRole('button', { name: /checkings/i }));
            expect(createAccount).toHaveBeenCalledWith("Checkings");
    
        });
        
        it("displays error when createAccount API fails", async () => {
            vi.mocked(useUserContext).mockReturnValue(mockUserContext);
            vi.mocked(createAccount).mockRejectedValue(new Error("API error"));
            render(<MemoryRouter><Home /></MemoryRouter>);
            
            await userEvent.click(screen.getByRole('button', { name: /checkings/i }));
            
            expect(await screen.findByRole('alert')).toHaveTextContent("Failed to open account. Please try again later.");
        });

        it("displays error when trying to open more than 3 accounts", async () => {
            const accounts = [
                { accountNumber: "1", type: "Checkings", balance: 100 },
                { accountNumber: "2", type: "Savings", balance: 200 },
                { accountNumber: "3", type: "Savings", balance: 300 }
            ];
            const userWithThreeAccounts = {
                username: 'testuser',
                user: { username: 'testuser', accounts: accounts, numOfAccounts: 3 },
                setUser: vi.fn(),
                fetchUser: vi.fn().mockResolvedValue({ username: 'testuser', accounts: accounts, numOfAccounts: 3 })
            };
            vi.mocked(useUserContext).mockReturnValue(userWithThreeAccounts);;
            
            render(<MemoryRouter><Home /></MemoryRouter>);
            
           await userEvent.click(screen.getByRole('button', { name: /checkings/i }));
            
            expect(await screen.findByRole('alert')).toHaveTextContent("You can only have 3 accounts");
        });

        
    });


})