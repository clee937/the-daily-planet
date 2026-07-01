import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { getUser, editUser, deleteUser, checkEmail } from "../../src/services/users";
import { ProfilePage } from "../../src/pages/Profile/ProfilePage";
import { toast } from "react-toastify";

// Mock useNavigate
const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

// Mock toast
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn() },
}));

// Mock the users service
vi.mock("../../src/services/users", () => ({
  getUser: vi.fn(),
  editUser: vi.fn(),
  deleteUser: vi.fn(),
  checkEmail: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Profile Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("redirects to /login if no token", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<ProfilePage />);
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  test("displays the user's username and email", async () => {
    localStorageMock.getItem.mockReturnValue("faketoken");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    render(<ProfilePage />);

    expect(await screen.findByText("Username: Buzz")).toBeTruthy();
    expect(screen.getByText("Email: buzz@nasa.gov")).toBeTruthy();
  });

  test("shows the email edit form", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    render(<ProfilePage />);

    await screen.findByText("Email: buzz@nasa.gov");

    await userEvent.click(screen.getAllByText("Edit")[0]);

    expect(screen.getByRole("textbox")).toBeTruthy();
  })

  test("updates the user's email", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    checkEmail.mockResolvedValue(false);
    editUser.mockResolvedValue({});

    render(<ProfilePage />);

    await screen.findByText("Email: buzz@nasa.gov");
    await userEvent.click(screen.getAllByText("Edit")[0]);

    const input = screen.getByRole("textbox");

    await userEvent.type(input, "new@nasa.gov");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(editUser).toHaveBeenCalledWith("token", {
        email: "new@nasa.gov",
      });
    });

    expect(screen.getByText("Email updated successfully!")).toBeTruthy();
  });

  test("shows an error if the email is already taken", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    checkEmail.mockResolvedValue(true);

    render(<ProfilePage />);

    await screen.findByText("Email: buzz@nasa.gov");
    await userEvent.click(screen.getAllByText("Edit")[0]);
    await userEvent.type(screen.getByRole("textbox"), "taken@nasa.gov");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("This email is already taken!")).toBeTruthy();
    expect(editUser).not.toHaveBeenCalled();
  });

  test("shows an error when the password is too short", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    render(<ProfilePage />);

    await screen.findByText("Username: Buzz");
    await userEvent.click(screen.getAllByText("Edit")[1]);

    const passwordInputs = screen.getAllByLabelText(/password/i);

    await userEvent.type(passwordInputs[0], "short");
    await userEvent.type(passwordInputs[1], "short");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeTruthy();
    expect(editUser).not.toHaveBeenCalled();
  });

  test("shows an error when passwords do not match", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    render(<ProfilePage />);

    await screen.findByText("Username: Buzz");
    await userEvent.click(screen.getAllByText("Edit")[1]);

    const passwordInputs = screen.getAllByLabelText(/password/i);

    await userEvent.type(passwordInputs[0], "Password1!");
    await userEvent.type(passwordInputs[1], "Password2!");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Passwords do not match!")).toBeTruthy();
    expect(editUser).not.toHaveBeenCalled();
  });

  test("updates the user's password", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    editUser.mockResolvedValue({});

    render(<ProfilePage />);

    await screen.findByText("Username: Buzz");
    await userEvent.click(screen.getAllByText("Edit")[1]);

    const passwordInputs = screen.getAllByLabelText(/password/i);

    await userEvent.type(passwordInputs[0], "Password1!");
    await userEvent.type(passwordInputs[1], "Password1!");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(editUser).toHaveBeenCalledWith("token", {password: "Password1!",});
    });
  });

  test("shows the delete confirmation", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    render(<ProfilePage />);

    await screen.findByText("Username: Buzz");

    await userEvent.click(screen.getByText("Delete Account"));

    expect(
      screen.getByText(/Are you sure you want to delete your account/i)
    ).toBeTruthy();
  });

  test("deletes the account", async () => {
    localStorageMock.getItem.mockReturnValue("token");

    getUser.mockResolvedValue({
      user: {
        username: "Buzz",
        email: "buzz@nasa.gov",
      },
    });

    deleteUser.mockResolvedValue({});

    render(<ProfilePage />);

    await screen.findByText("Username: Buzz");

    await userEvent.click(screen.getByText("Delete Account"));
    await userEvent.click(screen.getByText("Yes"));

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith("token");
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  test("shows a success toast when updating email", async () => {
  localStorageMock.getItem.mockReturnValue("token");

  getUser.mockResolvedValue({
    user: {
      username: "Buzz",
      email: "buzz@nasa.gov",
    },
  });

  checkEmail.mockResolvedValue(false);
  editUser.mockResolvedValue({});

  render(<ProfilePage />);

  await screen.findByText("Email: buzz@nasa.gov");
  await userEvent.click(screen.getAllByText("Edit")[0]);
  await userEvent.type(screen.getByRole("textbox"), "new@nasa.gov");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith("Email updated successfully! ✏️");
  });
});

test("shows a success toast when deleting account", async () => {
  localStorageMock.getItem.mockReturnValue("token");

  getUser.mockResolvedValue({
    user: {
      username: "Buzz",
      email: "buzz@nasa.gov",
    },
  });

  deleteUser.mockResolvedValue({});

  render(<ProfilePage />);

  await screen.findByText("Username: Buzz");
  await userEvent.click(screen.getByText("Delete Account"));
  await userEvent.click(screen.getByText("Yes"));

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith("Account successfully deleted 👋");
  });
});

test("shows a success toast when updating password", async () => {
  localStorageMock.getItem.mockReturnValue("token");

  getUser.mockResolvedValue({
    user: {
      username: "Buzz",
      email: "buzz@nasa.gov",
    },
  });

  editUser.mockResolvedValue({});

  render(<ProfilePage />);

  await screen.findByText("Username: Buzz");
  await userEvent.click(screen.getAllByText("Edit")[1]);

  const passwordInputs = screen.getAllByLabelText(/password/i);
  await userEvent.type(passwordInputs[0], "Password1!");
  await userEvent.type(passwordInputs[1], "Password1!");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith("Password updated successfully! ✏️");;
  });
});
});
