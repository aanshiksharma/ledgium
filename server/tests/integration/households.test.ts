import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../src/app";
import { prisma } from "../../src/db/prisma.js";
import { TEST_USERS, createHousehold, registerUser } from "../helpers.js";

describe("Household API", () => {
  describe("POST /api/v1/households", () => {
    it("creates a household and owner membership", async () => {
      const { token, user } = await registerUser(app);

      const response = await request(app)
        .post("/api/v1/households")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Mehta Home",
          currency: "INR",
        });

      expect(response.status).toBe(201);

      const household = response.body.data.household;

      expect(household).toMatchObject({
        name: "Mehta Home",
        currency: "INR",
      });

      expect(household.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: "OWNER",
            user: expect.objectContaining({
              id: user.id,
              email: TEST_USERS.aarav.email,
            }),
          }),
        ]),
      );

      const membership = await prisma.householdMember.findUnique({
        where: {
          householdId_userId: {
            householdId: household.id,
            userId: user.id,
          },
        },
      });

      expect(membership?.role).toBe("OWNER");
    });

    it("defaults currency to INR", async () => {
      const { token } = await registerUser(app);

      const household = await createHousehold(app, token, {
        name: "Default Currency Home",
      });

      expect(household.currency).toBe("INR");
    });

    it("normalizes lowercase currency", async () => {
      const { token } = await registerUser(app);

      const household = await createHousehold(app, token, {
        name: "Lowercase Currency Home",
        currency: "inr",
      });

      expect(household.currency).toBe("INR");
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(app)
        .post("/api/v1/households")
        .send({ name: "Unauthorized Home" });

      expect(response.status).toBe(401);
    });

    it("rejects invalid household data", async () => {
      const { token } = await registerUser(app);

      const response = await request(app)
        .post("/api/v1/households")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "A",
          currency: "IN",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/households", () => {
    it("returns only the authenticated user's households", async () => {
      const aarav = await registerUser(app, TEST_USERS.aarav);
      const riya = await registerUser(app, TEST_USERS.riya);

      await createHousehold(app, aarav.token, {
        name: "Aarav Home",
      });
      await createHousehold(app, riya.token, {
        name: "Riya Home",
      });

      const aaravResponse = await request(app)
        .get("/api/v1/households")
        .set("Authorization", `Bearer ${aarav.token}`);

      expect(aaravResponse.status).toBe(200);
      expect(aaravResponse.body.data.households).toHaveLength(1);
      expect(aaravResponse.body.data.households[0].name).toBe("Aarav Home");
    });

    it("returns an empty list when the user has no households", async () => {
      const { token } = await registerUser(app);

      const response = await request(app)
        .get("/api/v1/households")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.households).toEqual([]);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(app).get("/api/v1/households");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/households/:id", () => {
    it("returns a household the user belongs to", async () => {
      const { token } = await registerUser(app);
      const household = await createHousehold(app, token, {
        name: "Mehta Home",
      });

      const response = await request(app)
        .get(`/api/v1/households/${household.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.household.id).toBe(household.id);
    });

    it("does not allow another user to access the household", async () => {
      const aarav = await registerUser(app, TEST_USERS.aarav);
      const riya = await registerUser(app, TEST_USERS.riya);

      const household = await createHousehold(app, aarav.token, {
        name: "Aarav Private Home",
      });

      const response = await request(app)
        .get(`/api/v1/households/${household.id}`)
        .set("Authorization", `Bearer ${riya.token}`);

      expect(response.status).toBe(404);
    });

    it("returns 404 for a nonexistent household", async () => {
      const { token } = await registerUser(app);

      const response = await request(app)
        .get("/api/v1/households/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(app).get(
        "/api/v1/households/00000000-0000-0000-0000-000000000000",
      );

      expect(response.status).toBe(401);
    });
  });
});
