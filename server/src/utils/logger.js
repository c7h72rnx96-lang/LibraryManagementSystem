import { AuditLog } from "../models/index.js";

export const logAdminAction = async (
  req,
  action,
  targetType,
  targetId,
  details = "",
) => {
  try {
    await AuditLog.create({
      adminId: req.user.id,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
