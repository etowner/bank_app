import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import FrontPage from "./components/FrontPage/FrontPage";
import Home from "./components/Home/Home";
import Account from "./components/Account/Account";
import { UserContextProvider } from "./auth/UserContextProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={
             <Home />
            } />
            <Route path="/account/:accountNumber" element={
             <Account />
            } />
          </Route>
        </Routes>
      </UserContextProvider>
    </div>
  );
}

export default App;
