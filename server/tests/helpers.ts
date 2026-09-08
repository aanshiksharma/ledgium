import { expect } from "vitest";
import type { Express } from "express";
import request from "supertest";

export const TEST_USERS = {
  aarav: {
    name: "Aarav Mehta",
    email: "aarav.test@example.com",
    password: "Aarav@12345",
  },
  riya: {
    name: "Riya Sharma",
    email: "riya.test@example.com",
    password: "Riya@67890",
  },
} as const;

export async function registerUser(
  app: Express,
  user = TEST_USERS.aarav,
) {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(user);

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);

  return response.body.data;
}

export async function createHousehold(
  app: Express,
  token: string,
  data: { name?: string; currency?: string } = {},
) {
  const response = await request(app)
    .post("/api/v1/households")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: data.name ?? "Test Household",
      ...(data.currency ? { currency: data.currency } : {}),
    });

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);

  return response.body.data.household;
}
