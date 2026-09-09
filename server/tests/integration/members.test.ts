import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { createHousehold, registerUser, TEST_USERS } from "../helpers.js";

describe("household member APIs", () => {
  let token: string;
  let householdId: string;

  beforeEach(async () => {
    const auth = await registerUser(app, TEST_USERS.aarav);

    token = auth.token;

    const household = await createHousehold(app, token, {
      name: "Members Household",
    });

    householdId = household.id;
  });

  it("allows the owner to add a member", async () => {
    const user = await registerUser(app, TEST_USERS.riya);

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: user.user.email,
        role: "MEMBER",
      });

    expect(response.status).toBe(201);
  });

  it("allows the owner to add an admin", async () => {
    const user = await registerUser(app, TEST_USERS.riya);

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: user.user.email,
        role: "ADMIN",
      });

    expect(response.status).toBe(201);
  });

  it("prevents a member from adding another member", async () => {
    const member = await registerUser(app, TEST_USERS.riya);

    const addMember = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: member.user.email,
        role: "MEMBER",
      });

    expect(addMember.status).toBe(201);

    const thirdUser = await registerUser(app, {
      ...TEST_USERS.riya,
      email: "third-user@example.com",
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${member.token}`)
      .send({
        email: thirdUser.user.email,
        role: "MEMBER",
      });

    expect(response.status).toBe(403);
  });

  it("prevents an admin from adding another admin", async () => {
    const admin = await registerUser(app, TEST_USERS.riya);

    const added = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: admin.user.email,
        role: "ADMIN",
      });

    expect(added.status).toBe(201);

    const thirdUser = await registerUser(app, {
      ...TEST_USERS.riya,
      email: "third-admin@example.com",
    });

    const response = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        email: thirdUser.user.email,
        role: "ADMIN",
      });

    expect(response.status).toBe(403);
  });

  it("allows only the owner to change a member's role", async () => {
    const member = await registerUser(app, TEST_USERS.riya);

    const added = await request(app)
      .post(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: member.user.email,
        role: "MEMBER",
      });

    expect(added.status).toBe(201);

    const response = await request(app)
      .patch(`/api/v1/households/${householdId}/members/${member.user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        role: "ADMIN",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.member.role).toBe("ADMIN");
  });

  it("prevents removing the owner", async () => {
    // The beforeEach owner is the actual household owner.
    // We need the current owner's user ID from the household member list.
    const members = await request(app)
      .get(`/api/v1/households/${householdId}/members`)
      .set("Authorization", `Bearer ${token}`);

    expect(members.status).toBe(200);

    const ownerMember = members.body.data.members.find(
      (member: { role: string }) => member.role === "OWNER",
    );

    expect(ownerMember).toBeDefined();

    const response = await request(app)
      .delete(`/api/v1/households/${householdId}/members/${ownerMember.userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
  });

  it("rejects an invalid member UUID", async () => {
    const response = await request(app)
      .delete(`/api/v1/households/${householdId}/members/not-a-uuid`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
