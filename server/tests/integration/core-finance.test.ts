import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/db/prisma.js";
import { createHousehold, registerUser, TEST_USERS } from "../helpers.js";

describe("core finance APIs", () => {
  let token: string;
  let householdId: string;

  beforeEach(async () => {
    const auth = await registerUser(app, TEST_USERS.aarav);

    token = auth.token;

    const household = await createHousehold(app, token, {
      name: "Core Household",
    });

    householdId = household.id;
  });

  it("creates and lists accounts", async () => {
    const created = await request(app)
      .post(`/api/v1/households/${householdId}/accounts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "HDFC Bank",
        type: "BANK",
        openingBalance: 10000,
      });

    expect(created.status).toBe(201);
    expect(created.body.data.account.name).toBe("HDFC Bank");

    const listed = await request(app)
      .get(`/api/v1/households/${householdId}/accounts`)
      .set("Authorization", `Bearer ${token}`);

    expect(listed.status).toBe(200);
    expect(listed.body.data.accounts).toHaveLength(1);
  });

  it("creates a transaction and reflects it in the dashboard", async () => {
    const account = await prisma.account.create({
      data: {
        householdId,
        name: "Cash",
        type: "CASH",
        openingBalance: 1000,
      },
    });

    const category = await prisma.category.findFirstOrThrow({
      where: {
        householdId,
        name: "Food",
      },
    });

    const transaction = await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        accountId: account.id,
        categoryId: category.id,
        amount: -250,
        description: "Dinner",
        transactionDate: "2026-09-08",
      });

    expect(transaction.status).toBe(201);
    expect(transaction.body.data.transaction.amount).toBe("-250");

    const dashboard = await request(app)
      .get(`/api/v1/households/${householdId}/dashboard`)
      .set("Authorization", `Bearer ${token}`);

    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.totalBalance).toBe("750");
  });

  it("creates a transfer as two linked transactions", async () => {
    const from = await prisma.account.create({
      data: {
        householdId,
        name: "Bank",
        type: "BANK",
        openingBalance: 5000,
      },
    });

    const to = await prisma.account.create({
      data: {
        householdId,
        name: "Cash",
        type: "CASH",
        openingBalance: 100,
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/transactions/transfers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: 1000,
        transactionDate: "2026-09-08",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.outgoing.amount).toBe("-1000");
    expect(response.body.data.incoming.amount).toBe("1000");

    const linked = await prisma.transaction.findMany({
      where: {
        transferId: response.body.data.transferId,
      },
    });

    expect(linked).toHaveLength(2);
  });

  it("prevents one household from accessing another household's account", async () => {
    const other = await registerUser(app, TEST_USERS.riya);

    const otherHousehold = await createHousehold(app, other.token, {
      name: "Other Household",
    });

    const account = await prisma.account.create({
      data: {
        householdId: otherHousehold.id,
        name: "Private Bank",
        type: "BANK",
      },
    });

    const response = await request(app)
      .get(`/api/v1/households/${otherHousehold.id}/accounts/${account.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
