import { SupportTicket, SupportMessage, User } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { emitToUser } from "../socket.js";

export const SupportService = {
  async createTicket(userId, subject, message) {
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
    return ticket;
  },

  async getTickets(userId, role) {
    const whereClause = role === "admin" ? {} : { userId };
    return await SupportTicket.findAll({
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
  },

  async getMessages(userId, role, ticketId) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new AppError("Ticket not found.", 404);
    if (role !== "admin" && userId !== ticket.userId)
      throw new AppError("Unauthorized access to ticket.", 403);

    const messages = await SupportMessage.findAll({
      where: { ticketId },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return { ticket, messages };
  },

  async replyToTicket(userId, role, ticketId, message) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new AppError("Ticket not found.", 404);
    if (role !== "admin" && userId !== ticket.userId)
      throw new AppError("Unauthorized access.", 403);
    if (ticket.status === "Closed")
      throw new AppError("Ticket is closed.", 400);

    const newMessage = await SupportMessage.create({
      ticketId,
      senderId: userId,
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

    if (role === "admin") {
      emitToUser(ticket.userId, "ticket_reply", populatedMessage);
    }

    return populatedMessage;
  },

  async closeTicket(userId, role, ticketId) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new AppError("Ticket not found.", 404);
    if (role !== "admin" && userId !== ticket.userId)
      throw new AppError("Unauthorized access.", 403);

    ticket.status = "Closed";
    await ticket.save();
    return { message: "Ticket marked as resolved." };
  },
};
