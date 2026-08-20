import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBookOpen, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.CartItems || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Removed from cart");
      fetchCart();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  // --- E-COMMERCE MATH ---
  const calculateItemPrice = (book) => {
    const base = Number(book.price) || 0;
    const disc = book.discountPercentage || 0;
    return disc > 0 ? base * (1 - disc / 100) : base;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + calculateItemPrice(item.Book) * item.quantity;
  }, 0);

  // Free delivery if subtotal is over Rs. 1000, else Rs. 100 fee (0 if cart is empty)
  const deliveryFee = cartItems.length === 0 ? 0 : subtotal >= 1000 ? 0 : 100;
  const grandTotal = subtotal + deliveryFee;
  // -----------------------

  const navigate = useNavigate(); // Make sure this is declared at the top of your Cart component

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        <FaShoppingCart className="me-2" /> My Shopping Cart
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center mt-5">
          <FaBookOpen size={60} className="text-muted mb-3" />
          <h4>Your cart is empty</h4>
          <p className="text-muted">Go to the Books page to add some books!</p>
        </div>
      ) : (
        <div className="row mt-4">
          {/* Cart Items List */}
          <div className="col-md-8">
            {cartItems.map((item) => {
              const itemPrice = calculateItemPrice(item.Book);
              const originalPrice = Number(item.Book.price) || 0;
              const hasDisc = item.Book.discountPercentage > 0;

              return (
                <div
                  key={item.id}
                  className="card mb-3 shadow-sm position-relative"
                >
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                    title="Remove item"
                  >
                    <FaTrash />
                  </button>

                  <div className="row g-0">
                    <div className="col-md-2">
                      <img
                        src={
                          item.Book.image?.startsWith("http")
                            ? item.Book.image
                            : `${SERVER_URL}/uploads/${item.Book.image}`
                        }
                        className="img-fluid rounded-start"
                        alt={item.Book.title}
                        style={{
                          height: "100%",
                          minHeight: "120px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="col-md-10 d-flex align-items-center">
                      <div className="card-body">
                        <h5 className="card-title fw-bold pe-4">
                          {item.Book.title}
                        </h5>

                        <div className="mb-2">
                          {hasDisc ? (
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-success fw-bold">
                                Rs. {itemPrice.toFixed(2)}
                              </span>
                              <span className="text-decoration-line-through text-muted small">
                                Rs. {originalPrice.toFixed(2)}
                              </span>
                              <span className="badge bg-danger">
                                -{item.Book.discountPercentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="fw-bold">
                              Rs. {originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <p className="card-text mb-0 text-muted">
                          Quantity: <strong>{item.quantity}</strong> | Total:{" "}
                          <span className="text-dark fw-bold">
                            Rs. {(itemPrice * item.quantity).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Sidebar Summary */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold">Order Summary</h5>
                <hr />
                <p className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>Rs. {subtotal.toFixed(2)}</strong>
                </p>
                <p className="d-flex justify-content-between mb-2">
                  <span>Delivery Charge:</span>
                  <strong>
                    {deliveryFee === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </strong>
                </p>
                {subtotal < 1000 && subtotal > 0 && (
                  <small className="text-muted d-block mb-3">
                    Add <strong>Rs. {(1000 - subtotal).toFixed(2)}</strong> more
                    for free delivery!
                  </small>
                )}
                <hr />
                <p className="d-flex justify-content-between fs-5 fw-bold">
                  <span>Grand Total:</span>
                  <span className="text-success">
                    Rs. {grandTotal.toFixed(2)}
                  </span>
                </p>

                <button
                  onClick={handleCheckout}
                  className="btn btn-success w-100 mt-3 py-2 fw-bold"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
