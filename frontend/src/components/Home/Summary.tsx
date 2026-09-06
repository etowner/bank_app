import { Card } from "react-bootstrap";
import type { Account } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";

interface Props {
  accounts: Account[];
}



export default function FinancialSummary({ accounts }: Props) {
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <>
      <Card.Header className="card-header-primary">
        <h4>Financial Summary</h4>
      </Card.Header>
      <Card.Body>
        <div className="summary-total">
          <span className="summary-total-label">Net Worth</span>
          <span className="summary-total-value">{formatCurrency(total)}</span>
        </div>
        <hr />
        {accounts.length === 0 ? (
          <p className="text-muted mb-0">No accounts yet.</p>
        ) : (
          accounts.map((a) => (
            <div key={a.accountNumber} className="summary-account-row">
              <span className="summary-account-type">
                {a.type}{" "}
                <span className="summary-account-number text-muted">
                  #{a.accountNumber}
                </span>
              </span>
              <span className="summary-account-balance">{formatCurrency(a.balance)}</span>
            </div>
          ))
        )}
      </Card.Body>
    </>
  );
}