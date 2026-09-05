import AccountBox from "./AccountBox";
import ThemeToggle from "../Home/ThemeToggle";
import "../../styles/FrontPage.css";

const FrontPage = () => (
  <div className="FrontPage">
    <div className="Frontpage-toggle">  <ThemeToggle /> </div>
    <div className="FrontPage-header">
      <h1>Aegis</h1>
      <p className="frontpage-tagline">Secure banking, simplified.</p>
    </div>
    <AccountBox />
  </div>
);

export default FrontPage;