const request = require("supertest");
const app = require("../src/app");

require("./setup");

describe("User Tests", () => {
  let userToken;
  let userId;
  let adminToken;
  let adminId;

  beforeEach(async () => {
    // Create regular user
    const userResponse = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      age: 25,
    });

    userToken = userResponse.body.token;
    userId = userResponse.body.data._id;

    // Create admin user
    const adminResponse = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      age: 30,
      role: "admin",
    });

    adminToken = adminResponse.body.token;
    adminId = adminResponse.body.data._id;
  });

  describe("GET /api/users/me", () => {
    it("should get current user profile", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("john@example.com");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should not get profile without authentication", async () => {
      const response = await request(app).get("/api/users/me").expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/users", () => {
    it("should get all users as admin", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should not get all users as regular user", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get single user as admin", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(userId);
    });

    it("should not get user as regular user", async () => {
      const response = await request(app)
        .get(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update own profile", async () => {
      const updateData = {
        name: "John Updated",
        age: 26,
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.age).toBe(updateData.age);
    });

    it("should allow admin to update any user", async () => {
      const updateData = {
        name: "Admin Updated Name",
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it("should not update other user's profile as regular user", async () => {
      const updateData = {
        name: "Unauthorized Update",
      };

      const response = await request(app)
        .put(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user as admin", async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should not delete user as regular user", async () => {
      const response = await request(app)
        .delete(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
