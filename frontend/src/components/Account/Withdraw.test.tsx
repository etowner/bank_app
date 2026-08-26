import { render, screen, waitFor } from '../../lib/test-utils';
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Withdraw from "./Withdraw";
import { withdraw } from "../../api/transactionApi";


vi.mock("../../api/transactionApi");

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ accountNumber: "1234567890" }) };
});

const user = userEvent.setup();

const renderWithdraw = () => {
  const setAccount = vi.fn();
  const fetchAccountData = vi.fn();
  const balance = 500;
  render( <Withdraw balance={balance} setAccount={setAccount} fetchAccountData={fetchAccountData} />
  );

  return { balance, setAccount, fetchAccountData };

}

describe("Withdraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the withdraw form", () => {
    renderWithdraw();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test("submits a valid withdraw amount", async () => {
    const {setAccount, fetchAccountData } = renderWithdraw();

  
    await user.type(screen.getByRole("spinbutton"), "100.50");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    
    await waitFor(() => expect(withdraw).toHaveBeenCalledWith("1234567890", 100.50));
    expect(setAccount).toHaveBeenCalled();
    await waitFor(() => expect(fetchAccountData).toHaveBeenCalled());
   
  });

  test("shows an error for invalid withdraw amounts", async () => {
    const user = userEvent.setup();

  renderWithdraw();

    await user.type(screen.getByRole("spinbutton"), "600");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/insufficient funds./i);
  });

  test("shows an error when the withdraw API call fails", async () => {
    vi.mocked(withdraw).mockRejectedValueOnce(new Error("API error"));
    
    renderWithdraw();
    
    await user.type(screen.getByRole("spinbutton"), "100");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/withdrawal failed. please try again./i);
  });
});
