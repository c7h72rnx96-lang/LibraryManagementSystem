import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Genres from "./pages/Genres/Genres.jsx";
import Authors from "./pages/Authors/Authors.jsx";
import Books from "./pages/Books/Books.jsx";
import AddBook from "./pages/AddBook/AddBook.jsx";

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
        <Route path="books/add" element={<AddBook />} />
        <Route path="books/edit/:id" element={<AddBook />} />
      </Route>
    </Routes>
  );
}

export default App;
