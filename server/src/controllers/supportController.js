import { SupportService } from "../services/SupportService.js";

export const createTicket = async (req, res, next) => {
  try {
    const result = await SupportService.createTicket(
      req.user.id,
      req.body.subject,
      req.body.message,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const result = await SupportService.getTickets(req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTicketMessages = async (req, res, next) => {
  try {
    const result = await SupportService.getMessages(
      req.user.id,
      req.user.role,
      req.params.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const result = await SupportService.replyToTicket(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body.message,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const closeTicket = async (req, res, next) => {
  try {
    const result = await SupportService.closeTicket(
      req.user.id,
      req.user.role,
      req.params.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
