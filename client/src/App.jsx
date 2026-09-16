import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";

import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/ProtectedRoute/PublicOnlyRoute.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import AdminOrders from "./pages/Orders/AdminOrders.jsx";
import OrderDetails from "./pages/Orders/OrderDetails.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Genres from "./pages/Genres/Genres.jsx";
import Authors from "./pages/Authors/Authors.jsx";
import Books from "./pages/Books/Books.jsx";
import AddBook from "./pages/AddBook/AddBook.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import BookDetails from "./pages/BookDetails/BookDetails.jsx";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";
import UserManagement from "./pages/Admin/UserManagement.jsx";
import SellerOrders from "./pages/Orders/SellerOrders.jsx";
import SellerWallet from "./pages/Wallet/SellerWallet.jsx";
import BulkUpload from "./pages/Books/BulkUpload";
import Coupons from "./pages/Coupons/Coupons.jsx";
import Storefront from "./pages/Storefront/Storefront.jsx";
import SellerInventory from "./pages/Seller/SellerInventory.jsx";
import AdminPayouts from "./pages/Admin/AdminPayouts.jsx";
import UserDetails from "./pages/Admin/UserDetails.jsx";
import CustomerDashboard from "./pages/Dashboard/CustomerDashboard.jsx";
import AuditLogs from "./pages/Admin/AuditLogs.jsx";
import CustomerSupport from "./pages/Support/CustomerSupport.jsx";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            user?.role === "customer" ? <CustomerDashboard /> : <Dashboard />
          }
        />

        {/* ========================================== */}
        {/* PUBLIC & SHARED AUTHENTICATED ROUTES       */}
        {/* ========================================== */}
        <Route path="books" element={<Books />} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="support" element={<CustomerSupport />} />
        <Route path="store/:sellerId" element={<Storefront />} />

        {/* ========================================== */}
        {/* ADMIN ONLY ROUTES                          */}
        {/* ========================================== */}
        <Route
          path="manage-orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage-orders/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage-users/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="coupons"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Coupons />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/payouts"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPayouts />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="genres"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Genres />
            </ProtectedRoute>
          }
        />
        <Route
          path="authors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Authors />
            </ProtectedRoute>
          }
        />

        {/* ========================================== */}
        {/* SELLER ONLY ROUTES                         */}
        {/* ========================================== */}
        <Route
          path="store-orders"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="wallet"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="seller/books"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerInventory />
            </ProtectedRoute>
          }
        />

        {/* ========================================== */}
        {/* ADMIN & SELLER SHARED ROUTES               */}
        {/* ========================================== */}
        <Route
          path="books/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller"]}>
              <AddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="books/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller"]}>
              <AddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="books/bulk"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller"]}>
              <BulkUpload />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
