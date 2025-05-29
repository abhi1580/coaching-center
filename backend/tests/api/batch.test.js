import request from "supertest";
import app from "../../src/server.js";
import User from "../../src/models/User.js";
import Batch from "../../src/models/Batch.js";

describe("Batch API Tests", () => {
  let token;
  let teacher;

  beforeEach(async () => {
    // Create a teacher user
    teacher = await User.create({
      name: "Test Teacher",
      email: "teacher@example.com",
      password: "password123",
      role: "teacher",
    });

    // Login to get token
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "teacher@example.com",
      password: "password123",
    });

    token = loginRes.body.token;
  });

  describe("POST /api/batches", () => {
    it("should create a new batch", async () => {
      const batchData = {
        name: "Test Batch",
        subject: "Mathematics",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxStudents: 30,
        teacher: teacher._id,
      };

      const res = await request(app)
        .post("/api/batches")
        .set("Authorization", `Bearer ${token}`)
        .send(batchData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", batchData.name);
      expect(res.body).toHaveProperty("subject", batchData.subject);
    });

    it("should not create batch without authentication", async () => {
      const batchData = {
        name: "Test Batch",
        subject: "Mathematics",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxStudents: 30,
        teacher: teacher._id,
      };

      const res = await request(app).post("/api/batches").send(batchData);

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/batches", () => {
    beforeEach(async () => {
      // Create some test batches
      await Batch.create([
        {
          name: "Batch 1",
          subject: "Mathematics",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          maxStudents: 30,
          teacher: teacher._id,
        },
        {
          name: "Batch 2",
          subject: "Physics",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          maxStudents: 25,
          teacher: teacher._id,
        },
      ]);
    });

    it("should get all batches", async () => {
      const res = await request(app)
        .get("/api/batches")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it("should filter batches by subject", async () => {
      const res = await request(app)
        .get("/api/batches?subject=Mathematics")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].subject).toBe("Mathematics");
    });
  });
});
