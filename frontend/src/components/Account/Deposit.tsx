import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Form, Row, Col } from "react-bootstrap";
import { deposit } from "@/api/transactionApi";
import type { Account } from "@/lib/types";

interface DepositProps {
  setAccount: (account: Account) => void;
  fetchAccountData: () => Promise<void>;
}

export default function Deposit({ setAccount, fetchAccountData }: DepositProps) {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDepositClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }

    setLoading(true);
    try {
      const updatedAccount = await deposit(accountNumber!, parsedAmount);
      setAmount("");
      setError(null);
      setAccount(updatedAccount);
      await fetchAccountData();
    } catch (error) {
      setError("Deposit failed. Please try again.");
      console.error(error);
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
              onClick={(e) => void handleDepositClick(e)}
              disabled={loading}
            >
              {loading ? "Processing…" : "Confirm"}
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