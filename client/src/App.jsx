import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Main CSS File
import "./styles.css";

// Importing main views
import Dashboard from "./views/Dashboard";
import Transactions from "./views/Transactions";
import Settings from "./views/Settings";
import Landing from "./views/Landing";
import NotFound from "./views/NotFound";
import Signup from "./views/auth/Signup";
import Login from "./views/auth/Login";
import ChangePassword from "./views/auth/ChangePassword";
import ForgotPassword from "./views/auth/ForgotPassword";
import ResetPassword from "./views/auth/ResetPassword";
import HomePageController from "./HomePageController";
import Support from "./views/Support";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePageController />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
