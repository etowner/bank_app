import { useState } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { useUserContext } from "@/context/UserContext";
import { transfer } from "@/api/transactionApi";
import { getAxiosError } from "@/api/axiosConfig";

export default function Transfer() {
  const { fetchUser } = useUserContext();
  const [amount, setAmount] = useState("");
  const [accountNumber1, setAccountNumber1] = useState("");
  const [accountNumber2, setAccountNumber2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransferClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!accountNumber1 || !accountNumber2) {
      setError("Please enter both account numbers.");
      return;
    }
    if (accountNumber1 === accountNumber2) {
      setError("Source and destination accounts must be different.");
      return;
    }

    setLoading(true);
    try {
      await transfer(accountNumber1, accountNumber2, parsedAmount);
      setAmount("");
      setAccountNumber1("");
      setAccountNumber2("");
      setError(null);
      await fetchUser();
    } catch (err) {
      setError(getAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bank-card">
      <Card.Header className="card-header-primary">
        <h4>Transfer</h4>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="transfer-from" className="mb-3">
            <Form.Label>From account</Form.Label>
            <Form.Control
              value={accountNumber1}
              onChange={(e) => setAccountNumber1(e.target.value)}
              placeholder="Account number"
            />
          </Form.Group>
          <Form.Group  controlId="transfer-to" className="mb-3">
            <Form.Label>To account</Form.Label>
            <Form.Control
              value={accountNumber2}
              onChange={(e) => setAccountNumber2(e.target.value)}
              placeholder="Account number"
            />
          </Form.Group>
          <Form.Group  controlId="transfer-amount"className="mb-4">
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
          <div className="transfer-card">
            <Button
              variant="dark"
              onClick={(e) => void handleTransferClick(e)}
              disabled={loading}
            >
              {loading ? "Processing…" : "Transfer"}
            </Button>
          </div>
          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}