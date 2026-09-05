import { Nav, Navbar, Container } from "react-bootstrap";
import ProfileManager from "./ProfileManager/ProfileManager";
import ThemeToggle from "./ThemeToggle";

const Header = () => (
    <Navbar variant="dark" className="mb-4">
     
        <Navbar.Brand>Aegis</Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          <ThemeToggle />
          {/* <Navbar.Text className="me-2">Signed in as:</Navbar.Text> */}
          <ProfileManager />
        </Nav>
     
    </Navbar>
);
export default Header;
