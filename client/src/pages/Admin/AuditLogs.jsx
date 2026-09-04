import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShieldAlt, FaUserShield, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (error) {
      toast.error("Failed to fetch security logs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2 mb-5">
      <h2 className="fw-bold mb-4 text-white d-flex align-items-center">
        <FaShieldAlt className="me-3 text-danger" /> System Audit Logs
      </h2>
      <p className="text-muted mb-4">
        Immutable record of all administrative actions and security events.
      </p>

      <div
        className="card shadow-lg border-0 rounded-4 overflow-hidden"
        style={{ background: "rgba(15, 23, 42, 0.7)" }}
      >
        <div className="table-responsive">
          <table
            className="table table-dark table-hover align-middle m-0 text-white"
            style={{ background: "transparent" }}
          >
            <thead style={{ background: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th className="py-3 px-4 border-0">Timestamp</th>
                <th className="py-3 px-4 border-0">Administrator</th>
                <th className="py-3 px-4 border-0">Action Taken</th>
                <th className="py-3 px-4 border-0">Target Entity</th>
                <th className="py-3 px-4 border-0">Details / IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td className="py-3 px-4 border-0 text-muted small">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 border-0">
                      <div className="d-flex align-items-center gap-2">
                        <FaUserShield className="text-primary" />
                        <span className="fw-bold">
                          {log.Admin?.username || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-0">
                      <span
                        className={`badge px-2 py-1 ${log.action.includes("BLOCK") ? "bg-danger" : log.action.includes("SETTLE") ? "bg-success" : "bg-info text-dark"}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-0 text-muted font-monospace small">
                      {log.targetType} #{log.targetId}
                    </td>
                    <td className="py-3 px-4 border-0">
                      <div className="small text-light">
                        {log.details || "—"}
                      </div>
                      <div
                        className="small text-muted font-monospace"
                        style={{ fontSize: "10px" }}
                      >
                        IP: {log.ipAddress || "Unknown"}
                      </div>
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

export default AuditLogs;
