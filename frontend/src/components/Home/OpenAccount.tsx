import { Accordion, Button, ListGroup, useAccordionButton} from "react-bootstrap";

function CustomToggle({ children, eventKey, onToggle }: 
  { children: React.ReactNode; eventKey: string; onToggle: () => void }) {
  
  const showAcc = useAccordionButton(eventKey, onToggle);
  
  return (
    <Button variant="dark" onClick={showAcc} className="mt-3">
      {children}
    </Button>
  );
}

interface OpenAccountProps {
  openAcc: (accountType: string) => void;
  setError: (error: string | null) => void;
}

export default function OpenAccount({ openAcc, setError }: OpenAccountProps) {
  
  return (
    <Accordion defaultActiveKey="1">
      <CustomToggle eventKey="0" onToggle={() => setError(null)}>
        Open a new account
      </CustomToggle>
      <Accordion.Collapse eventKey="0">
        <div className="mt-2">
          <ListGroup>
            <ListGroup.Item action onClick={() => openAcc("Checkings")}>
              Checkings
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => openAcc("Savings")}>
              Savings
            </ListGroup.Item>
          </ListGroup>
        </div>
      </Accordion.Collapse>
    </Accordion>
  );
}
