import React, { useState, useContext } from "react";
import { Button, Card, Col, Form, Row, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { UserContext } from "../../UserContext";

export default function Transfer() {
  const { userID } = useParams();
  const { getUser } = useContext(UserContext)
  const [amount, setAmount] = useState(0);
  const [accountID1, setAccountID1] = useState(0);
  const [accountID2, setAccountID2] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTransferClick = (event) => {
    event.preventDefault();

    if (isNaN(amount) || amount <= 0) {
      setError("Invalid transfer amount. Please enter a valid amount.");
      return;
    }

    const transferAmmount = parseFloat(amount);
    setLoading(true);

    api
      .put(
        `/api/v1/user/${userID}/${accountID1}/${accountID2}`,
        transferAmmount,
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        console.log(response.data); // response.data is a string
        setAmount(0);
        setError(null);
        getUser(userID);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Transfer failed");
        setLoading(false);
      });
    
    
  };

  return (
    <div>
      <Card border="dark">
        <Card.Header style={{ color: "white", backgroundColor: "#282c34" }}>
          <h2>Transfer</h2>
        </Card.Header>
        <Card.Body>
          <Form.Group as={Row} className="mb-1">
            <Form.Label column sm={5}>
              <h3>Transfer from:</h3>
            </Form.Label>
            <Col sm={1}></Col>
            <Col sm={4}>
              <Form.Control
                value={accountID1}
                onChange={(e) => setAccountID1(e.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-1">
            <Form.Label column sm={5}>
              <h3> Transfer to: </h3>
            </Form.Label>
            <Col sm={1}></Col>
            <Col sm={4}>
              <Form.Control
                value={accountID2}
                onChange={(e) => setAccountID2(e.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-1">
            <Form.Label column sm={6}>
              <h3>Transfer amount:</h3>
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Col>
          </Form.Group>
          <Row className="justify-content-md-center">
            <Col sm={2}>
              <Button
                variant="dark"
                onClick={handleTransferClick}
                className="mb-3"
              >
                {loading ? <>Loading..</> : <>Submit</>}
              </Button>
            </Col>
          </Row>
          {
            <Row className="justify-content-md-center">
              <Col sm={7}>
                {error && <Alert variant="danger">{error}</Alert>}
              </Col>
            </Row>
          }
        </Card.Body>
      </Card>
    </div>
  );
}
