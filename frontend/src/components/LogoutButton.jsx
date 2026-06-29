import { useNavigate } from "react-router-dom";

function LogoutButton( {setIsLoggedIn} ) {
  const navigate = useNavigate();

  function logOut() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  }

  return <button onClick={logOut}>Log out</button>;
}

export default LogoutButton;
