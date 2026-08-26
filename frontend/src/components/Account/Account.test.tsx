import AccountPage from "./Account";
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from "react-router-dom";
import { getTransactions } from "../../api/transactionApi";
import { getAccount } from "../../api/accountApi";
import { getAxiosError } from "../../api/axiosConfig";
import { formatDate } from '../../lib/utils';
import { render, screen, waitFor } from '../../lib/test-utils';
import type { Account, Transaction } from "../../lib/types";

const mockNavigate = vi.fn();
const user = userEvent.setup();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ accountNumber: "1234567890" }) };
});

vi.mock("../../api/accountApi");
vi.mock("../../api/axiosConfig");
vi.mock("../../api/transactionApi");

vi.mock("./CloseAccount.tsx", () => ({
  default: () => <div data-testid="close-account">Mocked CloseAccount</div>,
}));

vi.mock("./LineChart.tsx", () => ({
  default: () => <div data-testid="line-chart">Mocked LineChart</div>,
}));

const mockAccount: Account = {
  accountNumber: "1234567890",
  type: "Savings",
  balance: 1000,
};

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "Deposit",    
    amount: 100,
    counterparty: "",
    timestamp: "2023-01-01",
  },
  {
    id: "2",
    type: "Withdrawal",
    amount: 50,
    counterparty: "",
    timestamp: "2023-01-02",
}
];


const renderAccountPage = async () => {
  render(
    <MemoryRouter initialEntries={["/account/1234567890"]}>
      <AccountPage />
    </MemoryRouter>
  );

  await waitFor(() => expect(getAccount).toHaveBeenCalledWith("1234567890"));
  await waitFor(() => expect(getTransactions).toHaveBeenCalledWith("1234567890"));
};

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccount).mockResolvedValue(mockAccount);
    vi.mocked(getTransactions).mockResolvedValue(mockTransactions);
  });

  test("renders account details and transactions", async () => {
    await renderAccountPage();

    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: `${mockAccount.type} - ${mockAccount.accountNumber}` })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: `Balance: $${mockAccount.balance}` })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: `Transaction History` })).toBeInTheDocument();
    
    // Check if transactions are displayed
    expect(screen.getByRole("table")).toBeInTheDocument();
    mockTransactions.forEach((txn) => {
      expect(screen.getByRole("cell", { name: txn.type })).toBeInTheDocument();
      expect(screen.getByRole("cell", { name: txn.amount.toString() })).toBeInTheDocument();
      expect(screen.getByRole("cell", { name: formatDate(txn.timestamp) })).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: `Transaction Options` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deposit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeInTheDocument();

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("close-account")).toBeInTheDocument();
   
  });

  test("handles API errors gracefully", async () => {
    vi.mocked(getAccount).mockRejectedValueOnce(new Error("API error"));
    vi.mocked(getTransactions).mockRejectedValueOnce(new Error("API error"));

    await renderAccountPage();

    expect(getAxiosError).toHaveBeenCalled();
  });

  test("navigates back to home when Back link is clicked", async () => {  
      await renderAccountPage();
      const backLink = screen.getByRole("button", { name: "Back" });
      
      await user.click(backLink);
      expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

});

