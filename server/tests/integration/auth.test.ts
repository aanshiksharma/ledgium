import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../src/app";
import { prisma } from "../../src/db/prisma.js";
import { TEST_USERS, registerUser } from "../helpers.js";

describe("Authentication API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("registers a new user and returns a JWT", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(TEST_USERS.aarav);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const { user, token } = response.body.data;

      expect(token).toEqual(expect.any(String));
      expect(user).toMatchObject({
        name: TEST_USERS.aarav.name,
        email: TEST_USERS.aarav.email,
        imageUrl: null,
      });
      expect(user).not.toHaveProperty("passwordHash");

      const databaseUser = await prisma.user.findUnique({
        where: { email: TEST_USERS.aarav.email },
      });

      expect(databaseUser?.passwordHash).toEqual(expect.any(String));
      expect(databaseUser?.passwordHash).not.toBe(TEST_USERS.aarav.password);
    });

    it("normalizes email to lowercase", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...TEST_USERS.aarav,
          email: "AARAV.TEST@EXAMPLE.COM",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(TEST_USERS.aarav.email);
    });

    it("rejects a duplicate email", async () => {
      await registerUser(app);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(TEST_USERS.aarav);

      expect(response.status).toBe(409);
    });

    it("rejects invalid registration data", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        name: "A",
        email: "not-an-email",
        password: "1234567",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in with valid credentials", async () => {
      await registerUser(app);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: TEST_USERS.aarav.email,
        password: TEST_USERS.aarav.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toEqual(expect.any(String));
      expect(response.body.data.user.email).toBe(TEST_USERS.aarav.email);
    });

    it("accepts email case differences", async () => {
      await registerUser(app);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: TEST_USERS.aarav.email.toUpperCase(),
        password: TEST_USERS.aarav.password,
      });

      expect(response.status).toBe(200);
    });

    it("rejects an incorrect password", async () => {
      await registerUser(app);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: TEST_USERS.aarav.email,
        password: "WrongPassword@123",
      });

      expect(response.status).toBe(401);
    });

    it("rejects an unknown email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "unknown.test@example.com",
        password: "Password@123",
      });

      expect(response.status).toBe(401);
    });

    it("rejects invalid login data", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "invalid-email" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/google", () => {
    it("rejects an invalid Google credential", async () => {
      const response = await request(app)
        .post("/api/v1/auth/google")
        .send({ credential: "not-a-real-google-token" });

      expect(response.status).toBe(401);
    });

    it("rejects a missing Google credential", async () => {
      const response = await request(app).post("/api/v1/auth/google").send({});

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns the authenticated user", async () => {
      const { token } = await registerUser(app);

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe(TEST_USERS.aarav.email);
    });

    it("rejects requests without authentication", async () => {
      const response = await request(app).get("/api/v1/auth/me");

      expect(response.status).toBe(401);
    });

    it("rejects an invalid JWT", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("returns the correct user for separate tokens", async () => {
      const aarav = await registerUser(app, TEST_USERS.aarav);
      const riya = await registerUser(app, TEST_USERS.riya);

      const aaravResponse = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${aarav.token}`);

      const riyaResponse = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${riya.token}`);

      expect(aaravResponse.body.data.user.email).toBe(TEST_USERS.aarav.email);
      expect(riyaResponse.body.data.user.email).toBe(TEST_USERS.riya.email);
    });
  });
});
