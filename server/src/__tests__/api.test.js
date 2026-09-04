import request from "supertest";
import app from "../app.js";

describe("LibraryMS Enterprise API - Core Functions", () => {
  // Test 1: System Health Check
  it("should return 200 OK for the server root endpoint", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  // Test 2: Authentication Validation Security
  it("should block login attempts with missing passwords", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@library.com" });

    expect(response.statusCode).toBe(400);
    // Matching your exact backend JSON structure:
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details[0].message).toBe("Password is required");
  });

  // Test 3: Unauthorized Access Protection
  it("should deny access to protected profile route without a JWT token", async () => {
    const response = await request(app).get("/api/auth/profile");

    expect(response.statusCode).toBe(401);
    // Matching your exact backend JSON structure:
    expect(response.body.error).toBe("Access denied");
  });
});
