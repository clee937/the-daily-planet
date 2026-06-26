import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { useNavigate } from "react-router-dom";
import { signup } from "../../src/services/authentication";

import { SignupPage } from "../../src/pages/Signup/SignupPage";

// Mocking React Router's useNavigate function
vi.mock("react-router-dom", () => {
  const navigateMock = vi.fn();
  const useNavigateMock = () => navigateMock; // Create a mock function for useNavigate
  return { useNavigate: useNavigateMock };
});

// Mocking the signup service
vi.mock("../../src/services/authentication", () => {
  const signupMock = vi.fn();
  return { signup: signupMock };
});

// Mocking localStorage
const localStorageMock = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Reusable function for filling out signup form
async function completeSignupForm() {
  const user = userEvent.setup();

  const emailInputEl = screen.getByLabelText("Email:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const usernameInputEl = screen.getByLabelText("Username:");
  const submitButtonEl = screen.getByRole("submit-button");

  await user.type(emailInputEl, "test@email.com");
  await user.type(passwordInputEl, "12345678!");
  await user.type(usernameInputEl, "testuser")
  await user.click(submitButtonEl);
}

describe("Signup Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("allows a user to signup", async () => {
    render(<SignupPage />);

    await completeSignupForm();

    expect(signup).toHaveBeenCalledWith("test@email.com", "12345678!", "testuser");
  });

  test("navigates to /login on successful signup", async () => {
    signup.mockResolvedValue("secrettoken123");
    render(<SignupPage />);
    const navigateMock = useNavigate();
    await completeSignupForm();
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  test("navigates to /signup on unsuccessful signup", async () => {
    render(<SignupPage />);

    signup.mockRejectedValue(new Error("Error signing up"));
    const navigateMock = useNavigate();

    await completeSignupForm();

    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.getByText("Email or username already exists")).toBeTruthy();
  });

  test("shows an error if password does not contain a special character", async () => {
    render(<SignupPage />);

    const user = userEvent.setup();
    const emailInputEl = screen.getByLabelText("Email:");
    const passwordInputEl = screen.getByLabelText("Password:");
    const usernameInputEl = screen.getByLabelText("Username:");
    const submitButtonEl = screen.getByRole("submit-button");

    await user.type(emailInputEl, "test@email.com");
    await user.type(passwordInputEl, "12345678"); 
    await user.type(usernameInputEl, "testuser");
    await user.click(submitButtonEl);

    expect(signup).not.toHaveBeenCalled();
  });

  test("shows error when fields are empty", async () => {
  render(<SignupPage />);

  const user = userEvent.setup();
  const submitButtonEl = screen.getByRole("submit-button");
  await user.click(submitButtonEl);

  expect(screen.getByText("All fields are required!")).toBeTruthy();
  expect(signup).not.toHaveBeenCalled();
});

test("shows error when email is invalid", async () => {
  render(<SignupPage />);

  const user = userEvent.setup();
  const emailInputEl = screen.getByLabelText("Email:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const usernameInputEl = screen.getByLabelText("Username:");
  const submitButtonEl = screen.getByRole("submit-button");

  await user.type(emailInputEl, "notanemail");
  await user.type(passwordInputEl, "12345678!");
  await user.type(usernameInputEl, "testuser");
  await user.click(submitButtonEl);

  expect(screen.getByText("Please enter a valid email!")).toBeTruthy();
  expect(signup).not.toHaveBeenCalled();
});

test("shows error when password is too short", async () => {
  render(<SignupPage />);

  const user = userEvent.setup();
  const emailInputEl = screen.getByLabelText("Email:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const usernameInputEl = screen.getByLabelText("Username:");
  const submitButtonEl = screen.getByRole("submit-button");

  await user.type(emailInputEl, "test@email.com");
  await user.type(passwordInputEl, "123!");
  await user.type(usernameInputEl, "testuser");
  await user.click(submitButtonEl);

  expect(screen.getByText("Password must be at least 8 characters!")).toBeTruthy();
  expect(signup).not.toHaveBeenCalled();
});
});
