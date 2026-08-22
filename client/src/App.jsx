import React from "react";
import { Routes, Route } from "react-router-dom";
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
function App() {
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
        <Route index element={<Dashboard />} />
        <Route path="genres" element={<Genres />} />
        <Route path="authors" element={<Authors />} />
        <Route path="books" element={<Books />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="manage-orders" element={<AdminOrders />} />
        <Route path="manage-orders/:id" element={<OrderDetails />} />

        {/* I ADDED THE PROFILE ROUTE RIGHT HERE! */}
        <Route path="profile" element={<Profile />} />

        <Route path="orders" element={<Orders />} />
        <Route path="books/add" element={<AddBook />} />
        <Route path="books/edit/:id" element={<AddBook />} />
        <Route path="books/:id" element={<BookDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
