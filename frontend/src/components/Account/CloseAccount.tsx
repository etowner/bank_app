import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Modal } from "react-bootstrap";
import { useUserContext } from "../../context/UserContext";
import { deleteAccount } from "../../api/accountApi";
import { getAxiosError } from "../../api/axiosConfig";

export default function CloseAccount() {
  const { fetchUser } = useUserContext();
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const navigate = useNavigate();
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const [error, setError] = useState<string | null>(null);



  const closeAccount =  async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    try {
      await deleteAccount(accountNumber!);
      void navigate(`/home`);
      // void fetchUser(); 
    } catch (err) {
      setError(getAxiosError(err));
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline-danger" onClick={handleShow}>
        Close Account
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Close Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to close this account? This cannot be undone.
        </Modal.Body>
        {error && <Alert variant="danger" className="mx-3">{error}</Alert>}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={(e) => void closeAccount(e)}
            disabled={loading}
          >
            {loading ? "Closing…" : "Close Account"}
          </Button>
           {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Footer>
      </Modal>
    </>
  );
}