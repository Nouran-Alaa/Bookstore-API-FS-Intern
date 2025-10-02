const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

// Load test setup
require("./setup");

describe("Authentication Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        age: 25,
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body).toHaveProperty("token");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should not register user with missing fields", async () => {
      const userData = {
        email: "john@example.com",
        password: "password123",
        // Missing name and age
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Please enter all fields");
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        age: 25,
      };

      // Register first time
      await request(app).post("/api/auth/register").send(userData);

      // Try to register again with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User already exists");
    });

    it("should register user with admin role", async () => {
      const userData = {
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        age: 30,
        role: "admin",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.data.role).toBe("admin");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a user before each login test
      await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        age: 25,
      });
    });

    it("should login user with correct credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("token");
      expect(response.body.data.email).toBe(loginData.email);
    });

    it("should not login with incorrect password", async () => {
      const loginData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should not login with non-existent email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should not login with missing fields", async () => {
      const loginData = {
        email: "john@example.com",
        // Missing password
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const response = await request(app).post("/api/auth/logout").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logged out successfully");
    });
  });
});
