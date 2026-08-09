import AccountBox from "./AccountBox";
import "../../styles/FrontPage.css";

const FrontPage = () => (
  <div className="FrontPage">
    <div className="FrontPage-header">
      <h1>Aegis</h1>
      <p className="frontpage-tagline">Secure banking, simplified.</p>
    </div>
    <AccountBox />
  </div>
);

export default FrontPage;