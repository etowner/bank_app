import { useState } from "react";
import { Button, Modal, Offcanvas, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import ChangePassword from "./ChangePassword";
import ChangeUsername from "./ChangeUsername";
import { deleteUser } from "../../../api/userApi";
import { deleteAllAccounts } from "../../../api/accountApi";

export default function ProfileManager() {
  const { username, logout, setUser } = useUserContext();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);

  const [showM, setShowM] = useState(false);
  const handleCloseM = () => setShowM(false);
  const handleShowM = () => setShowM(true);

  const [showD, setShowD] = useState(false);
  const handleCloseD = () => setShowD(false);
  const handleShowD = () => setShowD(true);

  const navigate = useNavigate();

  const handleLogOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void logout();
  };

  const handleYes = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      void await deleteUser();
      void await deleteAllAccounts();
      setUser(null);
      void navigate("/");
    } catch (error) {
      console.error(error);
      setShowD(false);
    }
  };

  const handlePasswordChangeClose = () => {
    setShowChangePassword(false);
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    handleClose();
  };

  const handleUsernameChangeClose = () => {
    setShowChangeUsername(false);
  };

  const handleUsernameChangeSuccess = () => {
    setShowChangeUsername(false);
    handleClose();
    void logout();
  };

  return (
    <>
      <a href="#profile" onClick={handleShow}>
        {username}
      </a>
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Profile</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup>
            <ListGroup.Item>
              <strong>Username:</strong> {username}
            </ListGroup.Item>

            {/* Change Username */}
            <ListGroup.Item action onClick={() => setShowChangeUsername(true)}>
              Change Username
            </ListGroup.Item>
            <Modal show={showChangeUsername} onHide={handleUsernameChangeClose}>
              <Modal.Header closeButton>
                <Modal.Title>Change Username</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ChangeUsername onClose={handleUsernameChangeClose} onSuccess={handleUsernameChangeSuccess} />
              </Modal.Body>
            </Modal>

            {/* Change Password */}
            <ListGroup.Item action onClick={() => setShowChangePassword(true)}>
              Change Password
            </ListGroup.Item>
            <Modal show={showChangePassword} onHide={handlePasswordChangeClose}>
              <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ChangePassword onClose={handlePasswordChangeClose} onSuccess={handlePasswordChangeSuccess} />
              </Modal.Body>
            </Modal>
            
            {/* Delete Account */}
            <ListGroup.Item action onClick={handleShowD}>
              Delete Account
            </ListGroup.Item>
            <Modal show={showD} onHide={handleCloseD}>
              <Modal.Header closeButton>
                <Modal.Title style={{ textAlign: "center" }}>
                  Delete Account
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ textAlign: "center" }}>
                Are you sure you want to delete this account? This cannot be
                undone!
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={(e) => void handleYes(e)}>
                  Yes
                </Button>
                <Button variant="primary" onClick={() => void handleCloseD()}>
                  No
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Log Out function */}
            <ListGroup.Item action onClick={handleShowM}>
              Log Out
            </ListGroup.Item>
            <Modal show={showM} onHide={handleCloseM}>
              <Modal.Header closeButton></Modal.Header>
              <Modal.Body style={{ textAlign: "center" }}>
                Are you sure you want to log out?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={handleLogOut}>
                  Log Out
                </Button>
              </Modal.Footer>
            </Modal>
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
