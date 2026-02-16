import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import Loading from "./components/Loading";
import PrivateRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboardadmin";
import DashboardUser from "./pages/Dashboarduser";
import StockPage from "./pages/stock";
import LoginAdmin from "./pages/loginadmin";
import LoginEmploye from "./pages/loginuser";
import RegisterEmploye from "./pages/registeruser";
import RegisterAdmin from "./pages/registeradmin";
import Unauthorized from "./pages/Unauthorized";

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-600">Une erreur est survenue. Veuillez réessayer plus tard.</div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/loginuser" replace />} />
          <Route path="/loginuser" element={<LoginEmploye />} />
          <Route path="/loginadmin" element={<LoginAdmin />} />
          <Route path="/register" element={<RegisterEmploye />} />
          <Route path="/registeruser" element={<RegisterEmploye />} />
          <Route path="/registeradmin" element={<RegisterAdmin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route path="/Dashboardadmin" element={<Dashboard />} />
          <Route path="/dashboarduser" element={<DashboardUser />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock" element={<StockPage />} />

          {/* Redirection pour les routes inconnues */}
          <Route path="*" element={<Navigate to="/loginuser" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
