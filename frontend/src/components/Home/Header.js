import React from "react";
import { Navbar } from "react-bootstrap";
import { Nav } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import ProfileManage from "../ProfileManager/ProfileManage";

const Header = ({ userID, password }) => {
  return (
    <div id="#home" style={{ background: "#ffffff" }}>
      <Navbar bg="dark" variant="dark" className="mb-5">
        <Container>
          <Navbar.Brand> Bank App</Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto"></Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Signed in as:
              <ProfileManage userID={userID} password={password} />
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};
export default Header;
