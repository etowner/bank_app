import { useEffect, useCallback, useState } from "react";
import { Card, Col, Container, Row, Table, Tab, Tabs } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Home/Header";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import CloseAccount from "./CloseAccount";
import LineChart from "./LineChart";
import { getTransactions } from "../../api/transactionApi";
import { getAccount } from "../../api/accountApi";
import { formatCurrency, formatDate, formatTransfer } from "../../lib/utils";
import type { Account, Transaction } from "../../lib/types";
import { getAxiosError } from "../../api/axiosConfig";
import "../../styles/Account.css";

const isCredit = (type: string) => type.toLowerCase() === "deposit";

const AccountPage = () => {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  const fetchAccountData = useCallback(async () => {
    try {
      const [acc, txns] = await Promise.all([
        getAccount(accountNumber!),
        getTransactions(accountNumber!),
      ]);
      setAccount(acc);
      setTransactions(txns);
    } catch (err) {
      console.error("Failed to fetch account data:", getAxiosError(err));
    }
  }, [accountNumber]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAccountData()
  }, [fetchAccountData]);

  return (
    <div className="Account">
      <Header />
      <Container className="py-4">
        <button className="account-back" onClick={() => void navigate("/home")}>
          ← Back
        </button>

        <div className="account-hero">
          <div className="account-hero-type">{account?.type} Account</div>
          <div className="account-hero-number">#{accountNumber}</div>
          <div className="account-hero-label">Current Balance</div>
          <div className="account-hero-balance">
            {account ? formatCurrency(account.balance) : "—"}
          </div>
        </div>

        <Row xs={1} md={2} className="g-4 mb-4">
          <Col>
            <Card className="bank-card">
              <Card.Header className="card-header-primary">
                <h4>Transaction History</h4>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            {formatTransfer(tx.type)}
                            {tx.counterparty ? ` — ${tx.counterparty}` : ""}
                          </td>
                          <td className={isCredit(tx.type) ? "tx-credit" : "tx-debit"}>
                            {isCredit(tx.type) ? "+" : "−"}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td>{formatDate(tx.timestamp)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="bank-card">
              <Card.Header className="card-header-primary">
                <h4>Transaction Options</h4>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey="deposit" className="mb-4" fill>
                  <Tab eventKey="deposit" title="Deposit">
                    <Deposit
                      setAccount={setAccount}
                      fetchAccountData={fetchAccountData}
                    />
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <Withdraw
                      balance={account?.balance}
                      setAccount={setAccount}
                      fetchAccountData={fetchAccountData}
                    />
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card className="bank-card">
              <Card.Header className="card-header-primary">
                <h4>Transaction Chart</h4>
              </Card.Header>
              <Card.Body>
                <LineChart
                  accountNumber={accountNumber!}
                  transactions={transactions}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <CloseAccount />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AccountPage;