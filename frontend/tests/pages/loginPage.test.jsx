import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { useNavigate, useOutletContext } from "react-router-dom";
import { login } from "../../src/services/authentication";
import { toast } from "react-toastify";
import { MemoryRouter } from "react-router-dom";

import { LoginPage } from "../../src/pages/Login/LoginPage";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    const navigateMock = vi.fn();
    const useNavigateMock = () => navigateMock; // Create a mock function for useNavigate
    return { 
      ...actual,
      useNavigate: useNavigateMock,
      useOutletContext: vi.fn(),
    };
});

// Mocking the login service
vi.mock("../../src/services/authentication", () => {
  const loginMock = vi.fn();
  return { login: loginMock };
});

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn() },
}));

// Reusable function for filling out login form
async function completeLoginForm() {
  const user = userEvent.setup();

  const emailInputEl = screen.getByLabelText("Email:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const submitButtonEl = screen.getByRole("submit-button");

  await user.type(emailInputEl, "test@email.com");
  await user.type(passwordInputEl, "1234");
  await user.click(submitButtonEl);
}

describe("Login Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("allows a user to login", async () => {
    useOutletContext.mockReturnValue({ isLoggedIn: false });

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    await completeLoginForm();

    expect(login).toHaveBeenCalledWith("test@email.com", "1234");
  });

  test("navigates to /login on unsuccessful login", async () => {
    useOutletContext.mockReturnValue({ isLoggedIn: false });

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    login.mockRejectedValue(new Error("Error logging in"));
    const navigateMock = useNavigate();

    await completeLoginForm();

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

    test("shows a success toast on login", async () => {
    useOutletContext.mockReturnValue({ isLoggedIn: false, setIsLoggedIn: vi.fn() });
    login.mockResolvedValue("secrettoken123");

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    await completeLoginForm();

    expect(toast.success).toHaveBeenCalled();
  });
});
