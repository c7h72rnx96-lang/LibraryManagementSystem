import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBookOpen,
  FaTrash,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Tracks which checkboxes are ticked!
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = response.data.CartItems || [];
      setCartItems(items);
      // Auto-select all items by default when the cart loads
      setSelectedItems(items.map((item) => item.id));
    } catch (error) {
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
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      setSelectedItems(selectedItems.filter((id) => id !== itemId)); // Remove from selected list too
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // --- NEW: Handle + and - Quantity Buttons ---
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Update local state instantly so the UI feels snappy
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  // --- NEW: Handle Checkbox Toggles ---
  const toggleSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId)); // Uncheck
    } else {
      setSelectedItems([...selectedItems, itemId]); // Check
    }
  };

  // --- E-COMMERCE MATH (ONLY APPLIES TO SELECTED ITEMS NOW!) ---
  const calculateItemPrice = (book) => {
    const base = Number(book.price) || 0;
    const disc = book.discountPercentage || 0;
    return disc > 0 ? base * (1 - disc / 100) : base;
  };

  const selectedCartObjects = cartItems.filter((item) =>
    selectedItems.includes(item.id),
  );
  const subtotal = selectedCartObjects.reduce(
    (acc, item) => acc + calculateItemPrice(item.Book) * item.quantity,
    0,
  );
  const deliveryFee =
    selectedItems.length === 0 ? 0 : subtotal >= 1000 ? 0 : 100;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return toast.error("Please select at least one item to checkout!");
    }
    // Pass the selected item IDs secretly to the Checkout page!
    navigate("/checkout", { state: { selectedCartItemIds: selectedItems } });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container mt-4 mb-5">
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
          <div className="col-md-8">
            {cartItems.map((item) => {
              const itemPrice = calculateItemPrice(item.Book);
              const originalPrice = Number(item.Book.price) || 0;
              const hasDisc = item.Book.discountPercentage > 0;
              const isSelected = selectedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`card mb-3 shadow-sm position-relative ${isSelected ? "border-primary" : "border-light"}`}
                >
                  {/* NEW: Checkbox to select/deselect item */}
                  <div
                    className="position-absolute top-50 start-0 translate-middle-y ms-3"
                    style={{ zIndex: 10 }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input border-secondary cursor-pointer"
                      style={{ transform: "scale(1.5)" }}
                      checked={isSelected}
                      onChange={() => toggleSelection(item.id)}
                    />
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                  >
                    <FaTrash />
                  </button>

                  <div className="row g-0 ps-4">
                    <div className="col-md-2 p-2">
                      <img
                        src={
                          item.Book.image?.startsWith("http")
                            ? item.Book.image
                            : `${SERVER_URL}/uploads/${item.Book.image}`
                        }
                        className="img-fluid rounded"
                        alt={item.Book.title}
                        style={{
                          height: "100%",
                          minHeight: "120px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="col-md-10 d-flex flex-column justify-content-center p-3">
                      <h5 className="fw-bold pe-4 text-primary">
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
                          </div>
                        ) : (
                          <span className="fw-bold">
                            Rs. {originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-end mt-auto">
                        {/* NEW: Quantity Controls (+ / -) */}
                        <div className="d-flex align-items-center gap-3 bg-light rounded px-2 py-1 border">
                          <button
                            className="btn btn-sm text-secondary p-1"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="fw-bold fs-5">{item.quantity}</span>
                          <button
                            className="btn btn-sm text-secondary p-1"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.Book.stock}
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        <div className="text-end">
                          <span className="text-muted small d-block">
                            Subtotal
                          </span>
                          <span className="text-dark fw-bold fs-5">
                            Rs. {(itemPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-md-4">
            <div
              className="card shadow-sm border-0 sticky-top"
              style={{ top: "20px" }}
            >
              <div className="card-body">
                <h5 className="fw-bold">Order Summary</h5>
                <small className="text-primary fw-bold d-block mb-2">
                  {selectedItems.length} Items Selected
                </small>
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
                  className="btn btn-success w-100 mt-3 py-2 fw-bold fs-5"
                  disabled={selectedItems.length === 0}
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
