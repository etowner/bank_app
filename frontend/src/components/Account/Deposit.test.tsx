import { render, screen, waitFor } from '../../lib/test-utils';
import userEvent from "@testing-library/user-event";
import { deposit } from "../../api/transactionApi";
import Deposit from "./Deposit";


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ accountNumber: "1234567890" }) };
});

vi.mock("../../api/transactionApi");

const user = userEvent.setup();

const renderDeposit = () => {
  const setAccount = vi.fn();
  const fetchAccountData = vi.fn();
  render( <Deposit setAccount={setAccount} fetchAccountData={fetchAccountData} />
  );

  return { setAccount, fetchAccountData };

  // await expect(amountNumber).toBe(1234567890);
}

describe("Deposit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the deposit form", () => {
    renderDeposit();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test("submits a valid deposit amount", async () => {
    const { setAccount, fetchAccountData } = renderDeposit();

    // renderDeposit();
    await user.type(screen.getByRole("spinbutton"), "100.50");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    
    await waitFor(() => expect(deposit).toHaveBeenCalledWith("1234567890", 100.50));
    expect(setAccount).toHaveBeenCalled();
    await waitFor(() => expect(fetchAccountData).toHaveBeenCalled());
   
  });

  test("shows an error for invalid deposit amounts", async () => {
    const user = userEvent.setup();

    renderDeposit();

    await user.type(screen.getByRole("spinbutton"), "-50");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/invalid deposit amount. please enter a valid amount./i);
  });

  test("shows an error when the deposit API call fails", async () => {
    vi.mocked(deposit).mockRejectedValueOnce(new Error("API error"));
    
    renderDeposit();
    await user.type(screen.getByRole("spinbutton"), "100");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/deposit failed. please try again./i);
  });
});
