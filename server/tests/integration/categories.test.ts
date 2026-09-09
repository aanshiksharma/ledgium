import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/db/prisma.js";
import { createHousehold, registerUser, TEST_USERS } from "../helpers.js";

describe("category APIs", () => {
  let token: string;
  let householdId: string;

  beforeEach(async () => {
    const auth = await registerUser(app, TEST_USERS.aarav);

    token = auth.token;

    const household = await createHousehold(app, token, {
      name: "Category Household",
    });

    householdId = household.id;
  });

  it("creates a category", async () => {
    const response = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Entertainment",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.category.name).toBe("Test Entertainment");
  });

  it("creates a child category", async () => {
    const parent = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Shopping",
      });

    expect(parent.status).toBe(201);

    const child = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Clothing",
        parentId: parent.body.data.category.id,
      });

    expect(child.status).toBe(201);
    expect(child.body.data.category.parentId).toBe(
      parent.body.data.category.id,
    );
  });

  it("rejects a category from being its own parent", async () => {
    const category = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Self Parent Test",
      });

    expect(category.status).toBe(201);

    const response = await request(app)
      .patch(
        `/api/v1/households/${householdId}/categories/${category.body.data.category.id}`,
      )
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentId: category.body.data.category.id,
      });

    expect(response.status).toBe(400);
  });

  it("rejects an indirect category hierarchy cycle", async () => {
    const a = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "A",
      });

    const b = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "B",
        parentId: a.body.data.category.id,
      });

    const c = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "C",
        parentId: b.body.data.category.id,
      });

    expect(c.status).toBe(201);

    const response = await request(app)
      .patch(
        `/api/v1/households/${householdId}/categories/${a.body.data.category.id}`,
      )
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentId: c.body.data.category.id,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain(
      "A category cannot become an ancestor of itself",
    );
  });

  it("rejects a parent category from another household", async () => {
    const other = await registerUser(app, TEST_USERS.riya);

    const otherHousehold = await createHousehold(app, other.token, {
      name: "Other Household",
    });

    const otherCategory = await prisma.category.create({
      data: {
        householdId: otherHousehold.id,
        name: "Private",
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Invalid Child",
        parentId: otherCategory.id,
      });

    expect(response.status).toBe(400);
  });

  it("prevents deleting a category used by a transaction", async () => {
    const account = await prisma.account.create({
      data: {
        householdId,
        name: "Cash",
        type: "CASH",
      },
    });

    const category = await prisma.category.create({
      data: {
        householdId,
        name: "Used Category",
      },
    });

    await prisma.transaction.create({
      data: {
        householdId,
        accountId: account.id,
        categoryId: category.id,
        createdBy: (
          await prisma.householdMember.findFirstOrThrow({
            where: { householdId },
          })
        ).userId,
        amount: -100,
        description: "Test transaction",
        transactionDate: new Date("2026-09-08"),
      },
    });

    const response = await request(app)
      .delete(`/api/v1/households/${householdId}/categories/${category.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
  });

  it("prevents deleting a category with children", async () => {
    const parent = await prisma.category.create({
      data: {
        householdId,
        name: "Parent",
      },
    });

    await prisma.category.create({
      data: {
        householdId,
        name: "Child",
        parentId: parent.id,
      },
    });

    const response = await request(app)
      .delete(`/api/v1/households/${householdId}/categories/${parent.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
  });

  it("rejects an invalid category UUID", async () => {
    const response = await request(app)
      .get(`/api/v1/households/${householdId}/categories/not-a-uuid`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
