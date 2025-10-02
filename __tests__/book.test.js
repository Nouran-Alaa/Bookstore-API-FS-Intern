const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Book = require("../src/models/Book");

require("./setup");

describe("Book Tests", () => {
  let userToken;
  let userId;
  let adminToken;
  let bookId;

  // Create users and login before tests
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
  });

  describe("POST /api/books", () => {
    it("should create a book with authentication", async () => {
      const bookData = {
        title: "Node.js Mastery",
        description: "Complete guide to Node.js",
        amount: 50,
      };

      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(bookData.title);
      expect(response.body.data.amount).toBe(bookData.amount);
      expect(response.body.data.createdBy).toBe(userId);
    });

    it("should not create book without authentication", async () => {
      const bookData = {
        title: "Node.js Mastery",
        description: "Complete guide",
        amount: 50,
      };

      const response = await request(app)
        .post("/api/books")
        .send(bookData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should not create book with missing fields", async () => {
      const bookData = {
        title: "Node.js Mastery",
        // Missing description and amount
      };

      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should not create book with negative amount", async () => {
      const bookData = {
        title: "Node.js Mastery",
        description: "Complete guide",
        amount: -5,
      };

      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/books", () => {
    beforeEach(async () => {
      // Create some books
      await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Book 1",
          description: "Description 1",
          amount: 10,
        });

      await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Book 2",
          description: "Description 2",
          amount: 20,
        });
    });

    it("should get all books without authentication", async () => {
      const response = await request(app).get("/api/books").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/books/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Test Book",
          description: "Test Description",
          amount: 15,
        });

      bookId = response.body.data._id;
    });

    it("should get single book by ID", async () => {
      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Test Book");
    });

    it("should return 404 for non-existent book", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/books/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/books/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Original Title",
          description: "Original Description",
          amount: 25,
        });

      bookId = response.body.data._id;
    });

    it("should update own book", async () => {
      const updateData = {
        title: "Updated Title",
        amount: 30,
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.amount).toBe(updateData.amount);
    });

    it("should allow admin to update any book", async () => {
      const updateData = {
        title: "Admin Updated Title",
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it("should not update book without authentication", async () => {
      const updateData = {
        title: "Unauthorized Update",
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/books/:id", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Book to Delete",
          description: "Will be deleted",
          amount: 10,
        });

      bookId = response.body.data._id;
    });

    it("should delete own book", async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify book is deleted
      const getResponse = await request(app).get(`/api/books/${bookId}`);
      expect(getResponse.status).toBe(404);
    });

    it("should allow admin to delete any book", async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/books/:id/buy", () => {
    let anotherUserToken;
    let anotherUserId;

    beforeEach(async () => {
      // Create book
      const bookResponse = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Book for Sale",
          description: "Available for purchase",
          amount: 5,
        });

      bookId = bookResponse.body.data._id;

      // Create another user to buy the book
      const userResponse = await request(app).post("/api/auth/register").send({
        name: "Buyer User",
        email: "buyer@example.com",
        password: "password123",
        age: 28,
      });

      anotherUserToken = userResponse.body.token;
      anotherUserId = userResponse.body.data._id;
    });

    it("should buy a book successfully", async () => {
      const response = await request(app)
        .post(`/api/books/${bookId}/buy`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.book.amount).toBe(4); // Decreased from 5
      expect(response.body.data.user.books_bought_amount).toBe(1);
    });

    it("should not allow owner to buy their own book", async () => {
      const response = await request(app)
        .post(`/api/books/${bookId}/buy`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("You cannot buy your own book");
    });

    it("should not buy book with zero stock", async () => {
      // Create book with 0 amount
      const bookResponse = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Out of Stock Book",
          description: "No copies available",
          amount: 0,
        });

      const outOfStockBookId = bookResponse.body.data._id;

      const response = await request(app)
        .post(`/api/books/${outOfStockBookId}/buy`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Book is out of stock");
    });
  });
});
