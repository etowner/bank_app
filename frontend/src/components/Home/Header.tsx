import { Nav, Navbar, Container } from "react-bootstrap";
import ProfileManager from "./ProfileManager/ProfileManager";

const Header = () => (
  <Navbar bg="dark" variant="dark" className="mb-4">
    <Container>
      <Navbar.Brand>Aegis</Navbar.Brand>
      <Nav className="ms-auto align-items-center">
        <Navbar.Text className="me-2">Signed in as:</Navbar.Text>
        <ProfileManager />
      </Nav>
    </Container>
  </Navbar>
);
export default Header;
