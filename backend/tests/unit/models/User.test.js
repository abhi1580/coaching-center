import User from "../../../src/models/User.js";
import bcrypt from "bcryptjs";

describe("User Model Test", () => {
  it("should create & save user successfully", async () => {
    const validUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "teacher",
    };
    const savedUser = await User.create(validUser);

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.role).toBe(validUser.role);
    expect(savedUser.password).not.toBe(validUser.password); // Password should be hashed
  });

  it("should fail to save user without required fields", async () => {
    const userWithoutRequiredField = new User({ name: "Test User" });
    let err;

    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it("should fail to save user with invalid email", async () => {
    const userWithInvalidEmail = new User({
      name: "Test User",
      email: "invalid-email",
      password: "password123",
      role: "teacher",
    });

    let err;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it("should match password correctly", async () => {
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "teacher",
    });

    await user.save();
    const isMatch = await user.matchPassword("password123");
    expect(isMatch).toBe(true);
  });
});
