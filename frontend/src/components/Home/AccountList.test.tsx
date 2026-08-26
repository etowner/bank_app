import { render, screen } from '../../lib/test-utils';
import { MemoryRouter } from "react-router-dom";
import AccountList from "./AccountList";

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("AccountList", () => {
  
  test("renders the list of user accounts with View buttons", () => {
    const mockAccounts = [
      { accountNumber: "1234567890", type: "Savings", balance: 1000 },
      { accountNumber: "0987654321", type: "Checkings", balance: 2500 },
    ];

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AccountList accounts={mockAccounts} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /accounts/i }),).toBeInTheDocument();
    expect(screen.getByText(/savings - 1234567890/i)).toBeInTheDocument();
    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/checkings - 0987654321/i)).toBeInTheDocument();
    expect(screen.getByText(/2500/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /view/i })).toHaveLength(2);
  });

  test("renders balance and account type for each account", () => {
    const mockAccounts = [{ accountNumber: "1234567890", type: "Savings", balance: 1000 }];

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AccountList accounts={mockAccounts} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/savings/i)).toBeInTheDocument();
  });

  test("navigates to account details page when View button is clicked", () => {
    const mockAccounts = [{ accountNumber: "1234567890", type: "Savings", balance: 1000 }];

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <AccountList accounts={mockAccounts} />
      </MemoryRouter>,
    );

    const viewButton = screen.getByRole("button", { name: /view/i });
    viewButton.click();

    expect(mockNavigate).toHaveBeenCalledWith("/account/1234567890");
  });
});
