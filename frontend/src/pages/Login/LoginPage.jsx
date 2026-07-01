import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/authentication";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn } = useOutletContext(); 
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const token = await login(email, password);
      localStorage.setItem("token", token);
      toast.success("Logged in successfully! 🚀");
      setIsLoggedIn(true);
      navigate(from)
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
        <h2>Login</h2>
          <form onSubmit={handleSubmit}>
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
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <input className="hud-button" role="submit-button" id="submit" type="submit" value="Submit" />
          </form>
            <p className="signup-text">Dont have an account? Sign up <a href="/signup">here</a></p>
        </div>
      </div>
    </>
  );
}
