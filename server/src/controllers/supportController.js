// === src/controllers/supportController.js ===
import { SupportTicket, SupportMessage, User } from "../models/index.js";

export const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    const ticket = await SupportTicket.create({
      subject,
      userId,
      status: "Open",
    });

    await SupportMessage.create({
      ticketId: ticket.id,
      senderId: userId,
      message,
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Failed to create support ticket." });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const whereClause = role === "admin" ? {} : { userId: userId };

    const tickets = await SupportTicket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "Customer",
          attributes: ["username", "avatar", "email", "role"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Failed to load tickets." });
  }
};

export const getTicketMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });

    if (req.user.role !== "admin" && req.user.id !== ticket.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to ticket." });
    }

    const messages = await SupportMessage.findAll({
      where: { ticketId: id },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to load ticket messages." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) return res.status(404).json({ message: "Ticket not found." });
    if (ticket.status === "Closed")
      return res.status(400).json({ message: "Ticket is closed." });

    const newMessage = await SupportMessage.create({
      ticketId: id,
      senderId: req.user.id,
      message,
    });

    ticket.changed("updatedAt", true);
    await ticket.save();

    const populatedMessage = await SupportMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send ticket reply." });
  }
};

export const closeTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });

    ticket.status = "Closed";
    await ticket.save();
    res.status(200).json({ message: "Ticket marked as resolved." });
  } catch (error) {
    res.status(500).json({ message: "Failed to close ticket." });
  }
};
