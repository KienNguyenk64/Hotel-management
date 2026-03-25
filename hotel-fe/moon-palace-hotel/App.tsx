import React, { useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

import { BackToTop } from "./components/BackToTop";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ResetPassword } from "./pages/ResetPassword";

import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminBookings } from "./pages/admin/AdminBookings";
import { AdminGuests } from "./pages/admin/AdminGuests";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminRooms } from "./pages/admin/AdminRooms";
import { UserProfile } from "./pages/UserProfile";
import { Home } from "./pages/Home";
import { RoomDetail } from "./pages/RoomDetail";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { BookingPage } from "./pages/BookingPage";
import { Rooms } from "./pages/Rooms";
import { MyBookings } from "./pages/MyBookings";
import { PaymentPage } from "./pages/PaymentPage";
import { NotFound } from "./pages/NotFound";
import { DiningMenu } from "./pages/DiningMenu";
import { ServiceBooking } from "./pages/ServiceBooking";
import { Contact } from "./pages/Contact";
import { Promotions } from "./pages/Promotions";
import { Blog } from "./pages/Blog";
import { Gallery } from "./pages/Gallery";
import { Role } from "./types";
import { Loader2 } from "lucide-react";

import ZaloButton from "./components/Zalo";
import ChatbotItems from "./components/ChatbotItems";
// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout for Public Pages
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Global Widgets */}
      <ChatbotItems />
      <ZaloButton />
      <BackToTop />
    </div>
  );
};

interface SidebarLayoutProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-lux-50">
        <Loader2 className="animate-spin text-lux-500" size={40} />
      </div>
    );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ensure case-insensitive comparison
  if (requiredRole && user?.role) {
    const userRole = (user.role as string).toUpperCase();
    const targetRole = requiredRole.toUpperCase();

    if (userRole !== targetRole) {
      return <Navigate to="/" replace />; // Or unauthorized page
    }
  }

  return (
    <div className="flex min-h-screen bg-lux-50 font-sans text-lux-900">
      <Sidebar />
      <main className="ml-64 flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {children}
      </main>
      <ChatbotItems />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-lux-900">
        <div className="text-center">
          <Loader2
            className="animate-spin text-lux-500 mx-auto mb-4"
            size={48}
          />
          <p className="text-white font-serif tracking-widest">MOONLIGHT</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public Routes with Navbar & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/menu" element={<DiningMenu />} />
        <Route path="/book-service" element={<ServiceBooking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Routes with Sidebar */}
      <Route
        path="/dashboard"
        element={
          <SidebarLayout requiredRole={Role.ADMIN}>
            <AdminDashboard />
          </SidebarLayout>
        }
      />
      <Route
        path="/admin-rooms"
        element={
          <SidebarLayout requiredRole={Role.ADMIN}>
            <AdminRooms />
          </SidebarLayout>
        }
      />
      <Route
        path="/bookings"
        element={
          <SidebarLayout requiredRole={Role.ADMIN}>
            <AdminBookings />
          </SidebarLayout>
        }
      />
      <Route
        path="/guests"
        element={
          <SidebarLayout requiredRole={Role.ADMIN}>
            <AdminGuests />
          </SidebarLayout>
        }
      />
      <Route
        path="/admin-reviews"
        element={
          <SidebarLayout requiredRole={Role.ADMIN}>
            <AdminReviews />
          </SidebarLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <SidebarLayout requiredRole={Role.ADMIN}>
            <AdminSettings />
          </SidebarLayout>
        }
      />

      {/* User Routes (Profile/History) with Sidebar */}
      <Route
        path="/profile"
        element={
          <SidebarLayout requiredRole={Role.USER}>
            <UserProfile />
          </SidebarLayout>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <SidebarLayout requiredRole={Role.USER}>
            <MyBookings />
          </SidebarLayout>
        }
      />

      <Route
        path="/payment"
        element={
          <SidebarLayout requiredRole={Role.USER}>
            <PaymentPage />
          </SidebarLayout>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};
export default App;
