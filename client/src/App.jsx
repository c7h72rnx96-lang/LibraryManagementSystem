import React, { useContext } from "react"; // 🔥 1. Added useContext
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx"; // 🔥 2. Imported AuthContext

import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
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
  // 🔥 3. Get the logged-in user to check their role
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* 🔥 4. SHOW CUSTOMER DASHBOARD IF THEY ARE A CUSTOMER, OTHERWISE SHOW STANDARD DASHBOARD */}
        <Route
          index
          element={
            user?.role === "customer" ? <CustomerDashboard /> : <Dashboard />
          }
        />

        <Route path="genres" element={<Genres />} />
        <Route path="authors" element={<Authors />} />
        <Route path="books" element={<Books />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="manage-orders" element={<AdminOrders />} />
        <Route path="manage-orders/:id" element={<OrderDetails />} />
        <Route path="manage-users" element={<UserManagement />} />
        <Route path="manage-users/:id" element={<UserDetails />} />
        <Route path="store-orders" element={<SellerOrders />} />
        {/* I ADDED THE PROFILE ROUTE RIGHT HERE! */}
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<SellerWallet />} />
        <Route path="/books/bulk" element={<BulkUpload />} />
        <Route path="orders" element={<Orders />} />
        <Route path="books/add" element={<AddBook />} />
        <Route path="books/edit/:id" element={<AddBook />} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="/store/:sellerId" element={<Storefront />} />
        <Route path="/seller/books" element={<SellerInventory />} />
        <Route path="admin/payouts" element={<AdminPayouts />} />
        <Route path="admin/logs" element={<AuditLogs />} />
        <Route path="/support" element={<CustomerSupport />} />
      </Route>
    </Routes>
  );
}

export default App;
