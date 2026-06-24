const request = require("supertest");

const app = require("../../app");
const User = require("../../models/user");

require("../mongodb_helper");


describe("/users", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST, when email, username and password are provided", () => {
    test("the response code is 201", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "poppy@email.com", password: "1234", username: "testuser" });

      expect(response.statusCode).toBe(201);
    });

    test("a user is created", async () => {
      await request(app)
        .post("/users")
        .send({ email: "scarconstt@email.com", password: "1234", username: "testuser" });

      const users = await User.find();
      const newUser = users[users.length - 1];
      expect(newUser.email).toEqual("scarconstt@email.com");
    });
  });

  describe("POST, when password is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "skye@email.com" });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({ email: "skye@email.com" });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when email is missing", () => {
    test("response code is 400", async () => {
      const response = await request(app)
        .post("/users")
        .send({ password: "1234" });

      expect(response.statusCode).toBe(400);
    });

    test("does not create a user", async () => {
      await request(app).post("/users").send({ password: "1234" });

      const users = await User.find();
      expect(users.length).toEqual(0);
    });
  });

  describe("POST, when email already exists", () => {
  test("response code is 400", async () => {
    await request(app)
      .post("/users")
      .send({ email: "poppy@email.com", password: "1234", username: "testuser1" });

    const response = await request(app)
      .post("/users")
      .send({ email: "poppy@email.com", password: "1234", username: "testuser2" });

    expect(response.statusCode).toBe(400);
  });
});

describe("POST, when username already exists", () => {
  test("response code is 400", async () => {
    await request(app)
      .post("/users")
      .send({ email: "poppy1@email.com", password: "1234", username: "testuser" });

    const response = await request(app)
      .post("/users")
      .send({ email: "poppy2@email.com", password: "1234", username: "testuser" });

    expect(response.statusCode).toBe(400);
  });
});


describe("PATCH, when updating user details", () => {
test("updates user", async () => {

  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  const response = await request(app)
    .patch(`/users/${user._id}`)  
    .send({
      email: "updated@test.com",
      password: "123456789",
      username: "username"
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe("User updated");
});

test("returns 404 when user does not exist", async () => {
  const fakeId = "6a3beeb3e63df681f639a999"; // valid format but not in DB

  const response = await request(app)
    .patch(`/users/${fakeId}`)
    .send({
      email: "test@test.com",
    });

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe("User not found");
});

test("returns error for invalid user id", async () => {
  const response = await request(app)
    .patch("/users/invalid-id")
    .send({
      email: "test@test.com",
    });

  expect(response.statusCode).toBe(400);
});

test("updates only email field", async () => {
  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  const response = await request(app)
    .patch(`/users/${user._id}`)
    .send({
      email: "newemail@test.com"
    });

  expect(response.statusCode).toBe(200);

  const updated = await User.findById(user._id);
  expect(updated.email).toBe("newemail@test.com");
});

test("updates password", async () => {
  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  const oldPassword = user.password;

  await request(app)
    .patch(`/users/${user._id}`)
    .send({
      password: "newpassword123"
    });

  const updated = await User.findById(user._id);

  expect(updated.password).not.toBe(oldPassword);
});
})

describe("DELETE a user", () => {
  test("deletes user", async () => {
  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  const response = await request(app)
    .delete(`/users/${user._id}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe("User deleted");

  const deleted = await User.findById(user._id);
  expect(deleted).toBeNull();
});

test("returns 404 when user does not exist", async () => {
  const fakeId = "6a3beeb3e63df681f639a999";

  const response = await request(app)
    .delete(`/users/${fakeId}`);

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe("User not found");
});

test("returns 400 for an invalid user id", async () => {
  const response = await request(app)
    .delete("/users/not-a-valid-id");

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe("Something went wrong");
});

test("removes the user from the database", async () => {
  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  await request(app)
    .delete(`/users/${user._id}`);

  const deletedUser = await User.findById(user._id);

  expect(deletedUser).toBeNull();
});

test("returns 404 when deleting the same user twice", async () => {
  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  await request(app)
    .delete(`/users/${user._id}`);

  const response = await request(app)
    .delete(`/users/${user._id}`);

  expect(response.statusCode).toBe(404);
});
})

describe("GET /users/:id", () => {
  test("returns a user", async () => {
    const user = await User.create({
      email: "test@test.com",
      password: "12345678",
      username: "username"
    });

    const response = await request(app)
      .get(`/users/${user._id}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.user.email).toBe("test@test.com");
    expect(response.body.user.username).toBe("username");
  });

  test("returns 404 when user does not exist", async () => {
  const fakeId = "6a3beeb3e63df681f639a999";

  const response = await request(app)
    .get(`/users/${fakeId}`);

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe("User not found");
});

test("returns 400 for an invalid id", async () => {
  const response = await request(app)
    .get("/users/not-a-valid-id");

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe("Something went wrong");
});

test("does not return the password", async () => {
  const user = await User.create({
    email: "test@test.com",
    password: "12345678",
    username: "username"
  });

  const response = await request(app)
    .get(`/users/${user._id}`);

  expect(response.body.user.password).toBeUndefined();
});
});
});



