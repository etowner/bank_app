import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { Account } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";

export default function AccountList({ accounts }: { accounts: Account[] }) {
  const navigate = useNavigate();

  if (accounts.length === 0) {
    return <p className="text-muted mb-0">No accounts yet. Open one below.</p>;
  }

  return (
    <>
      {accounts.map((account) => (
        <div key={account.accountNumber} className="account-row">
          <div className="account-info">
            <span className="account-type">{account.type}</span>
            <span className="account-number">#{account.accountNumber}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="account-balance">{formatCurrency(account.balance)}</span>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => void navigate(`/account/${account.accountNumber}`)}
            >
              View
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}