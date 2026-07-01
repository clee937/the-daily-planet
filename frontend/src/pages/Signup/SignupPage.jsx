import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { signup } from "../../services/authentication";
import "../../Hud.css";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    
    if (!email || !password || !username) {
      setError("All fields are required!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters!");
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      setError("Password must contain at least one special character (! @ # $ % ^ & *)");
      return;
    }

    try {
      const token = await signup(email, password, username);
      localStorage.setItem("token", token)
      toast.success(
        <>
        Sign up successful!
        <br />
        Welcome to The Daily Planet 🚀
      </>
    );
      navigate("/login", { state: { from } });
    } catch (err) {
      console.error(err);
      setError("Email or username already exists");
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value)
  }

  return (
    <>
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              placeholder="Password"
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input className="hud-button" role="submit-button" id="submit" type="submit" value="Submit" />
        </form>
        <p className="signup-text">Already have an account? Log in <Link to="/login" state={{ from }}>here</Link></p>
      </div>
    </div>
    </>
  );
}
