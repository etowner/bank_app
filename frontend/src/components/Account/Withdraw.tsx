import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Form, Row, Col } from "react-bootstrap";
import { withdraw } from "@/api/transactionApi";
import type { Account } from "@/lib/types";

interface WithdrawProps {
  balance: number | undefined;
  setAccount: (account: Account) => void;
  fetchAccountData: () => Promise<void>;
}

export default function Withdraw({ balance, setAccount, fetchAccountData }: WithdrawProps) {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdrawClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }
    if (balance === undefined || balance - parsedAmount < 0) {
      setError("Insufficient funds.");
      return;
    }

    setLoading(true);
    try {
      const updatedAccount = await withdraw(accountNumber!, parsedAmount);
      setAmount("");
      setError(null);
      setAccount(updatedAccount);
      await fetchAccountData();
    } catch {
      setError("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form>
      <Row className="justify-content-center">
        <Col xs={12} md={7}>
      <Form.Group className="mb-3">
        <Form.Label>Amount</Form.Label>
        <Form.Control
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </Form.Group>
      <div className="d-grid">
        <Button
          variant="dark"
          onClick={(e) => void handleWithdrawClick(e)}
          disabled={loading}
        >
          {loading ? "Processing…" : "Withdraw"}
        </Button>
      </div>
      {error && (
        <Alert variant="danger" className="mt-3 mb-0">
          {error}
        </Alert>
      )}
      </Col>
      </Row>
    </Form>
  );
}