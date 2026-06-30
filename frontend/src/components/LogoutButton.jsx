import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function LogoutButton( {setIsLoggedIn} ) {
  const navigate = useNavigate();

  function logOut() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("Logged out successfully! 👋");
    navigate("/");
  }

  return <button onClick={logOut}>Log out</button>;
}

export default LogoutButton;
