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

  it("rejects an account currency that differs from the household currency", async () => {
    const response = await request(app)
      .post(`/api/v1/households/${householdId}/accounts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "USD Account",
        type: "BANK",
        openingBalance: 100,
        currency: "USD",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain(
      "Account currency must match the household currency",
    );
  });

  it("normalizes a matching account currency to uppercase", async () => {
    const response = await request(app)
      .post(`/api/v1/households/${householdId}/accounts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Cash",
        type: "CASH",
        currency: "inr",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.account.currency).toBe("INR");
  });

  it("rejects changing an account to a different currency", async () => {
    const account = await prisma.account.create({
      data: {
        householdId,
        name: "Bank",
        type: "BANK",
        currency: "INR",
      },
    });

    const response = await request(app)
      .patch(`/api/v1/households/${householdId}/accounts/${account.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        currency: "USD",
      });

    expect(response.status).toBe(400);
  });

  it("archives and restores an account", async () => {
    const account = await prisma.account.create({
      data: {
        householdId,
        name: "Savings",
        type: "BANK",
      },
    });

    const archived = await request(app)
      .post(`/api/v1/households/${householdId}/accounts/${account.id}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(archived.status).toBe(200);
    expect(archived.body.data.account.isActive).toBe(false);

    const restored = await request(app)
      .post(`/api/v1/households/${householdId}/accounts/${account.id}/restore`)
      .set("Authorization", `Bearer ${token}`);

    expect(restored.status).toBe(200);
    expect(restored.body.data.account.isActive).toBe(true);
  });

  it("rejects an invalid account UUID with 400", async () => {
    const response = await request(app)
      .get(`/api/v1/households/${householdId}/accounts/not-a-uuid`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("cannot create a transaction on an archived account", async () => {
    const account = await prisma.account.create({
      data: {
        householdId,
        name: "Archived Cash",
        type: "CASH",
        isActive: false,
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        accountId: account.id,
        amount: -100,
        description: "Should fail",
        transactionDate: "2026-09-08",
      });

    expect(response.status).toBe(400);
  });

  it("rejects a zero-value transaction", async () => {
    const account = await prisma.account.create({
      data: {
        householdId,
        name: "Cash",
        type: "CASH",
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        accountId: account.id,
        amount: 0,
        description: "Zero",
        transactionDate: "2026-09-08",
      });

    expect(response.status).toBe(400);
  });

  it("prevents a transaction from using another household's account", async () => {
    const other = await registerUser(app, TEST_USERS.riya);

    const otherHousehold = await createHousehold(app, other.token, {
      name: "Other Household",
    });

    const otherAccount = await prisma.account.create({
      data: {
        householdId: otherHousehold.id,
        name: "Private Account",
        type: "BANK",
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        accountId: otherAccount.id,
        amount: -100,
        description: "Cross household",
        transactionDate: "2026-09-08",
      });

    expect(response.status).toBe(400);
  });

  it("prevents transfers between accounts in different households", async () => {
    const from = await prisma.account.create({
      data: {
        householdId,
        name: "My Bank",
        type: "BANK",
      },
    });

    const other = await registerUser(app, TEST_USERS.riya);

    const otherHousehold = await createHousehold(app, other.token, {
      name: "Other Household",
    });

    const to = await prisma.account.create({
      data: {
        householdId: otherHousehold.id,
        name: "Other Cash",
        type: "CASH",
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/transactions/transfers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: 500,
        transactionDate: "2026-09-08",
      });

    expect(response.status).toBe(400);
  });

  it("rejects a zero-value transfer", async () => {
    const from = await prisma.account.create({
      data: {
        householdId,
        name: "Bank",
        type: "BANK",
      },
    });

    const to = await prisma.account.create({
      data: {
        householdId,
        name: "Cash",
        type: "CASH",
      },
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/transactions/transfers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: 0,
        transactionDate: "2026-09-08",
      });

    expect(response.status).toBe(400);
  });

  it("deletes both legs of a transfer together", async () => {
    const from = await prisma.account.create({
      data: {
        householdId,
        name: "Bank",
        type: "BANK",
      },
    });

    const to = await prisma.account.create({
      data: {
        householdId,
        name: "Cash",
        type: "CASH",
      },
    });

    const created = await request(app)
      .post(`/api/v1/households/${householdId}/transactions/transfers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: 1000,
        transactionDate: "2026-09-08",
      });

    expect(created.status).toBe(201);

    const transferId = created.body.data.transferId;

    const deleted = await request(app)
      .delete(
        `/api/v1/households/${householdId}/transactions/transfers/${transferId}`,
      )
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(204);

    const remaining = await prisma.transaction.count({
      where: {
        householdId,
        transferId,
      },
    });

    expect(remaining).toBe(0);
  });

  it("rejects an invalid transaction UUID", async () => {
    const response = await request(app)
      .get(`/api/v1/households/${householdId}/transactions/not-a-uuid`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("rejects an invalid transfer UUID", async () => {
    const response = await request(app)
      .delete(
        `/api/v1/households/${householdId}/transactions/transfers/not-a-uuid`,
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("rejects an invalid transfer UUID", async () => {
    const response = await request(app)
      .delete(
        `/api/v1/households/${householdId}/transactions/transfers/not-a-uuid`,
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
