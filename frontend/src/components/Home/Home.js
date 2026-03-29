import React, { useContext, useEffect, useState } from "react";
import { Card, Col, Container, Row, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { api } from "../../api/axiosConfig";
import Transfer from "../Transactions/Transfer";
import AccList from "./AccList";
import Header from "./Header";
import "./Home.css";
import OpenAccount from "./OpenAccount";
import PieChart from "./PieChart";
import { UserContext } from "../../UserContext";

const Home = () => {
  const { user, getUser } = useContext(UserContext)
  const { userID } = useParams(); // This is the userID from the URL
  const [password, setPassword] = useState();
  const [accList, setAccList] = useState([]);
  const [error, setError] = useState();


  const openAcc = async (type) => {
    if( accList.length >= 3){
      setError("You can only have 3 accounts");
      return;
    }
    try {
      const response = await api.post(`/api/v1/user/${userID}/${type}`);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }

    getUser(userID); 
  };

  useEffect(() => {
    getUser(userID);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);
  


  useEffect(() => {
    if (user) {
      Object.entries(user).forEach(([key, value]) => {
        if (key === "password") {
          setPassword(value);
        } else if (key === "accountList") {
          setAccList(value);
        }
      });
    }
    // console.log("Deconstruct user:", user);
  }, [user]);

  return (
    <div className="Home">
      <Header userID={userID} password={password} />
      <Container>
        <Row className="mb-5">
          <h2>Welcome {userID}</h2>
        </Row>
        <Row xs={1} md={2} lg={2} className="g-4">
          {/* Lists Accounts and provides open account options */}
          <Col key={1}>
            <Card border="dark">
              <AccList userID={userID} accList={accList} />
              <OpenAccount userID={userID} openAcc={openAcc} setError={setError} />
              {error && <Alert className="" variant="danger">{error}</Alert>}
            </Card>
          </Col>
          <Col key={2}>
            <Transfer />
          </Col>
          <Col key={3}>
            <Card style={{ width: "32rem" }} className="mb-2">
              <PieChart accounts={accList} />
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
