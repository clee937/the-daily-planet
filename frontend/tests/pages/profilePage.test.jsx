import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { getUser, editUser, deleteUser } from "../../src/services/users";
import { ProfilePage } from "../../src/pages/Profile/ProfilePage";

// Mock useNavigate
vi.mock("react-router-dom", () => {
  const navigateMock = vi.fn();
  const useNavigateMock = () => navigateMock;
  return { useNavigate: useNavigateMock };
});

// Mock the users service
vi.mock("../../src/services/users", () => ({
  getUser: vi.fn(),
  editUser: vi.fn(),
  deleteUser: vi.fn(),
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
    const navigateMock = useNavigate();
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  test("displays user details when loaded", async () => {
    localStorageMock.getItem.mockReturnValue("faketoken");
    getUser.mockResolvedValue({
      user: { email: "test@test.com", username: "testuser" },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Email: test@test.com")).toBeTruthy();
    });
  });

  test("calls editUser with new details on form submit", async () => {
    localStorageMock.getItem.mockReturnValue("faketoken");
    getUser.mockResolvedValue({
      user: { email: "test@test.com", username: "testuser" },
    });
    editUser.mockResolvedValue({});

    render(<ProfilePage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("New Email:"), "new@test.com");
    await user.type(screen.getByLabelText("New Password:"), "newpassword123!");
    await user.type(
      screen.getByLabelText("Confirm Password:"),
      "newpassword123!",
    );
    await user.click(screen.getByDisplayValue("Update"));

    expect(editUser).toHaveBeenCalledWith("faketoken", {
      email: "new@test.com",
      password: "newpassword123!",
    });
  });

  test("shows error message when passwords do not match", async () => {
    localStorageMock.getItem.mockReturnValue("faketoken");
    getUser.mockResolvedValue({
      user: { email: "test@test.com", username: "testuser" },
    });

    render(<ProfilePage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("New Password:"), "password123!");
    await user.type(
      screen.getByLabelText("Confirm Password:"),
      "differentpassword!",
    );
    await user.click(screen.getByDisplayValue("Update"));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match!")).toBeTruthy();
    });

    // Make sure editUser was NOT called
    expect(editUser).not.toHaveBeenCalled();
  });

  test("shows success message after editing", async () => {
    localStorageMock.getItem.mockReturnValue("faketoken");
    getUser.mockResolvedValue({
      user: { email: "test@test.com", username: "testuser" },
    });
    editUser.mockResolvedValue({});

    render(<ProfilePage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("New Email:"), "new@test.com");
    await user.click(screen.getByDisplayValue("Update"));

    await waitFor(() => {
      expect(screen.getByText("Details updated successfully!")).toBeTruthy();
    });
  });

  test("calls deleteUser and redirects to /signup on delete", async () => {
    localStorageMock.getItem.mockReturnValue("faketoken");
    getUser.mockResolvedValue({
      user: { email: "test@test.com", username: "testuser" },
    });
    deleteUser.mockResolvedValue({});

    render(<ProfilePage />);

    const user = userEvent.setup();
    const navigateMock = useNavigate();
    await user.click(screen.getByText("Delete Account"));

    expect(deleteUser).toHaveBeenCalledWith("faketoken");
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
