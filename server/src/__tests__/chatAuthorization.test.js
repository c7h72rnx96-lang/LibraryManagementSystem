import { ChatService } from "../services/ChatService.js";
import { User } from "../models/index.js";
import { sequelize } from "../config/database.js";

describe("Real-Time Chat Authorization", () => {
  let customer1, customer2, admin;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    customer1 = await User.create({
      username: "C1",
      email: "c1@test.com",
      password: "pwd",
      role: "customer",
    });
    customer2 = await User.create({
      username: "C2",
      email: "c2@test.com",
      password: "pwd",
      role: "customer",
    });
    admin = await User.create({
      username: "Admin",
      email: "admin@test.com",
      password: "pwd",
      role: "admin",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should block a Customer from creating a live message to another Customer", async () => {
    await expect(
      ChatService.saveAndAuthorizeMessage(customer1.id, customer2.id, "Hello"),
    ).rejects.toThrow("Customers cannot message each other directly.");
  });

  it("should allow a Customer to message an Admin", async () => {
    const message = await ChatService.saveAndAuthorizeMessage(
      customer1.id,
      admin.id,
      "Need help!",
    );
    expect(message.message).toBe("Need help!");
    expect(message.senderId).toBe(customer1.id);
  });
});
