import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMoneyCheckAlt,
  FaStore,
  FaCheckCircle,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const AdminPayouts = () => {
  const [sellers, setSellers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const [userRes, ledgerRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/payouts/history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const approvedSellers = userRes.data.filter(
        (u) => u.role === "seller" && u.storeStatus === "approved",
      );
      setSellers(approvedSellers);
      setLedger(ledgerRes.data);
    } catch (error) {
      toast.error("Failed to load payout data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayout = async (sellerId) => {
    if (
      !window.confirm("Mark this seller's balance as completely paid/settled?")
    )
      return;
    setProcessing(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_URL}/admin/users/${sellerId}/settle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Seller balance settled successfully!");
      fetchData(); // Refreshes both pending lists AND the ledger!
    } catch (error) {
      toast.error("Failed to settle payout.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  const pendingPayouts = sellers.filter((s) => Number(s.walletBalance) > 0);

  return (
    <div className="container-fluid mt-2 mb-5">
      <h2 className="fw-bold mb-4 text-white d-flex align-items-center">
        <FaMoneyCheckAlt className="me-3 text-info" /> Seller Payouts
      </h2>

      {/* PENDING PAYOUTS SECTION */}
      <div className="mb-5">
        <h5 className="text-white fw-bold mb-3">Pending Settlements</h5>
        {pendingPayouts.length === 0 ? (
          <div className="card bg-dark border-secondary text-center p-5 rounded-4">
            <h5 className="text-muted">No pending payouts.</h5>
            <p className="text-muted small m-0">All sellers have been paid.</p>
          </div>
        ) : (
          <div
            className="card shadow-sm border-0 rounded-4 overflow-hidden"
            style={{ background: "rgba(15, 23, 42, 0.7)" }}
          >
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle m-0">
                <thead style={{ background: "rgba(255,255,255,0.05)" }}>
                  <tr>
                    <th className="py-3 px-4 border-0">Store Details</th>
                    <th className="py-3 px-4 border-0">Current Cut</th>
                    <th className="py-3 px-4 border-0">Amount Owed</th>
                    <th className="py-3 px-4 border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayouts.map((seller) => (
                    <tr
                      key={seller.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td className="py-3 px-4 border-0">
                        <div className="d-flex align-items-center">
                          <FaStore className="text-info me-3" size={24} />
                          <div>
                            <h6 className="fw-bold m-0 text-white">
                              {seller.storeName || seller.username}
                            </h6>
                            <small className="text-muted">{seller.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-0 text-muted">
                        {seller.commissionRate}%
                      </td>
                      <td className="py-3 px-4 border-0">
                        <strong className="text-success fs-5">
                          Rs. {Number(seller.walletBalance).toFixed(2)}
                        </strong>
                      </td>
                      <td className="py-3 px-4 border-0 text-end">
                        <button
                          onClick={() => handleSettlePayout(seller.id)}
                          disabled={processing}
                          className="btn btn-sm btn-success fw-bold rounded-pill px-3 shadow-sm"
                        >
                          <FaCheckCircle className="me-1" /> Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN HISTORICAL STATEMENT LEDGER */}
      <h5 className="text-white fw-bold mb-3 d-flex align-items-center">
        <FaFileInvoiceDollar className="me-2 text-warning" /> Historical Payout
        Ledger
      </h5>
      <div
        className="card shadow-sm border-0 rounded-4 overflow-hidden"
        style={{ background: "rgba(15, 23, 42, 0.7)" }}
      >
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle m-0">
            <thead style={{ background: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th className="py-3 px-4 border-0">Date Processed</th>
                <th className="py-3 px-4 border-0">Transaction ID</th>
                <th className="py-3 px-4 border-0">Store Name</th>
                <th className="py-3 px-4 border-0">Amount Sent</th>
                <th className="py-3 px-4 border-0 text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No historical payouts found.
                  </td>
                </tr>
              ) : (
                ledger.map((record) => (
                  <tr
                    key={record.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td className="py-3 px-4 border-0 text-muted">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 border-0 text-muted font-monospace">
                      TXN-{record.id}000
                    </td>
                    <td className="py-3 px-4 border-0 fw-bold">
                      {record.Seller?.storeName || record.Seller?.username}
                    </td>
                    <td className="py-3 px-4 border-0 text-success fw-bold">
                      Rs. {Number(record.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 border-0 text-end">
                      <span className="badge bg-success rounded-pill px-3 py-2">
                        <FaCheckCircle className="me-1" /> {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayouts;
