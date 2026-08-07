import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Genres from "./pages/Genres/Genres.jsx";
import Authors from "./pages/Authors/Authors.jsx";
import Books from "./pages/Books/Books.jsx";
import AddBook from "./pages/AddBook/AddBook.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Genre Routes */}
        <Route path="genres" element={<Genres />} />

        {/* Author Routes */}
        <Route path="authors" element={<Authors />} />

        {/* Book Routes */}
        <Route path="books" element={<Books />} />
        <Route path="books/add" element={<AddBook />} />
        <Route path="books/edit/:id" element={<AddBook />} />
      </Route>
    </Routes>
  );
}

export default App;
