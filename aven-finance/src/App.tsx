import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { FinanceProvider } from "./context/FinanceContext";
import AppLayout from "./components/AppLayout";
import Analytics from './pages/Analytics'

import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Accounts from "./pages/Accounts";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

function ProtectedLayout() {
  const token = localStorage.getItem("aven-access-token");

if (!token) return <Navigate to="/login" replace />;

 

  return <AppLayout />;
}

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/send" element={<Send />} />
         
            <Route path="/receive" element={<Receive />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
}