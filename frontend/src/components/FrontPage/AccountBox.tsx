import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, Tab, Tabs, Card } from "react-bootstrap";
import { registerUser, loginUser } from "@/api/userApi";
import { getAxiosError } from "@/api/axiosConfig";
interface AuthFormProps {
  idPrefix: string; 
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  username: string;
  password: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
  isLogin: boolean;
}

const AuthForm = ({
  idPrefix,
  onSubmit,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  error,
  isLogin,
}: AuthFormProps) => (
  <Form>
    <Form.Group controlId={`${idPrefix}-username`} className="mb-3">
      <Form.Label>Username</Form.Label>
      <Form.Control
        autoComplete="username"
        value={username}
        onChange={onUsernameChange}
        placeholder="Enter your username"
      />
    </Form.Group>
    <Form.Group controlId={`${idPrefix}-password`} className="mb-4">
      <Form.Label>Password</Form.Label>
      <Form.Control
        autoComplete={isLogin ? "current-password" : "new-password"}
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Enter your password"
      />
    </Form.Group>
    <div className="d-grid">
      <Button variant="primary" size="lg" onClick={onSubmit}>
        {isLogin ? "Log In" : "Create Account"}
      </Button>
    </div>
    {error && (
      <Alert variant="danger" className="mt-3 mb-0">
        {error}
      </Alert>
    )}
  </Form>
);

const AccountBox = () => {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("create");
  const navigate = useNavigate();
  
  const register = async (username: string, password: string) => {
    setError(null);
    try {
      await registerUser(username, password);
    } catch (err) {
      setError(getAxiosError(err));
      console.error("Registration error:", err);
      return; 
    }
    void navigate(`/home`);
  };

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      await loginUser(username, password );
    } catch (err) {
      setError(getAxiosError(err));
      console.error("Login error:", err);
      return; 
    }
    void navigate(`/home`);
  };

  const handleCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    void register(username, password);
  };

  const handleLog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    void login(username, password);
  };

  const handleTabSwitch = (tab: string | null) => {
    if (tab == null) return;
    setActiveTab(tab);
    setError(null);
  };

  return (
    <Card className="account-box">
      <Card.Body className="p-4">
        <Tabs activeKey={activeTab} onSelect={handleTabSwitch} unmountOnExit className="mb-4" fill>
          <Tab eventKey="create" title="Create Account">
            <AuthForm idPrefix="create"
              onSubmit={handleCreate}
              username={username}
              password={password}
              onUsernameChange={(e) => setUsername(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              error={error}
              isLogin={false}
            />
          </Tab>
          <Tab eventKey="log" title="Log In">
            <AuthForm idPrefix="log"
              onSubmit={handleLog}
              username={username}
              password={password}
              onUsernameChange={(e) => setUsername(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              error={error}
              isLogin={true}
            />
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default AccountBox;