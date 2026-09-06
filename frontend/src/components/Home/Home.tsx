import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Alert } from "react-bootstrap";
import Transfer from "./Transfer";
import AccountList from "./AccountList";
import Header from "./Header";
import OpenAccount from "./OpenAccount";
import PieChart from "./PieChart";
import { useUserContext } from "../../context/UserContext";
import { createAccount } from "../../api/accountApi";
import "../../styles/Home.css";

const Home = () => {
  const { user, username, fetchUser } = useUserContext();
  const accounts = user?.accounts ?? [];
  const numOfAccounts = user?.numOfAccounts ?? 0;
  const [error, setError] = useState<string | null>(null);

  const openAcc = async (type: string) => {
    if (numOfAccounts >= 3) {
      setError("You can only have 3 accounts");
      return;
    }
    try {
      await createAccount(type);
      
    } catch {
      setError("Failed to open account. Please try again later.");
    }
    void fetchUser();
  };

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return (
    <div className="Home">
      <Header />
      <Container className="py-4">
        <div className="home-welcome mb-4">
          Welcome, {username}
        </div>
        <Row xs={1} md={2} className="g-4">
          <Col>
            <Card className="bank-card">
              <Card.Header className="card-header-primary">
                <h4>Accounts</h4>
              </Card.Header>
              <Card.Body>
                <AccountList accounts={accounts} />
                <OpenAccount
                  openAcc={(type) => void openAcc(type)}
                  setError={setError}
                />
                {error && (
                  <Alert variant="danger" className="mb-0 mt-2">
                    {error}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Transfer />
          </Col>
          <Col>
            <Card className="bank-card">
              <Card.Header className="card-header-primary">
                <h4>Balance Distribution</h4>
              </Card.Header>
              <Card.Body>
                <PieChart accounts={accounts} />
              </Card.Body>
            </Card>
          </Col>
          <Col>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;