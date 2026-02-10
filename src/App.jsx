// App.jsx (FULL UPDATED FILE)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { HomePage } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { TenantHouses } from "./pages/TenantHouses";
import { HouseDetails } from "./pages/HouseDetails";
import { NotFound } from "./pages/NotFound";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { RefundPolicy } from "./pages/RefundPolicy";
import { MyRents } from "./pages/MyRents";
import { MyVisits } from "./pages/MyVisits";
import { VisitRequests } from "./pages/VisitRequests";
import { TenantPayments } from "./pages/TenantPayments";
import { LandlordRentPayments } from "./pages/LandlordRentPayments";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

// Admin Pages
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminHouses } from "./pages/AdminHouses";
import { AdminPayments } from "./pages/AdminPayments";

// Landlord Pages
import { LandlordDashboard } from "./pages/LandlordDashboard";
import { AddHouse } from "./pages/AddHouse";
import { LandlordUpi } from "./pages/LandlordUpi";
import { LandlordTenants } from "./pages/LandlordTenants";


export function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tenant/houses" element={<TenantHouses />} />
              <Route path="/house/:id" element={<HouseDetails />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/tenant/payments/:houseId" element={<TenantPayments />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />



              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/houses"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminHouses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPayments />
                  </ProtectedRoute>
                }
              />

              {/* Landlord Protected Routes (require verified) */}
              <Route
                path="/landlord/dashboard"
                element={
                  <ProtectedRoute requiredRole="landlord" requireVerifiedLandlord>
                    <LandlordDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/landlord/rent-payments"
                element={
                  <ProtectedRoute requiredRole="landlord" requireVerifiedLandlord>
                    <LandlordRentPayments />
                  </ProtectedRoute>
                }
              />


              {/* ✅ FIX: Use requiredRole here too (you were using role="landlord") */}
              <Route
                path="/landlord/payment"
                element={
                  <ProtectedRoute requiredRole="landlord">
                    <LandlordUpi />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/landlord/add-house"
                element={
                  <ProtectedRoute requiredRole="landlord" requireVerifiedLandlord>
                    <AddHouse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/landlord/edit-house/:id"
                element={
                  <ProtectedRoute requiredRole="landlord" requireVerifiedLandlord>
                    <AddHouse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/landlord/tenants"
                element={
                  <ProtectedRoute requiredRole="landlord" requireVerifiedLandlord>
                    <LandlordTenants />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tenant/my-rents"
                element={
                  <ProtectedRoute requiredRole="tenant">
                    <MyRents />
                  </ProtectedRoute>
                }
              />

              <Route
              path="/tenant/my-visits"
              element={
                <ProtectedRoute requiredRole="tenant">
                  <MyVisits />
                </ProtectedRoute>
              }
            />

            <Route
              path="/landlord/visit-requests"
              element={
                <ProtectedRoute requiredRole="landlord" requireVerifiedLandlord>
                  <VisitRequests />
                </ProtectedRoute>
              }
            />


              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
