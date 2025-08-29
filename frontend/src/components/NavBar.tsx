import axios from "axios";
import "./App.css";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const profile = async () => {
    const response = await axios.get("http://localhost:8000/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data) {
      navigate("/profile", {
        state: {
          data: response.data,
        },
      });
    } else {
      console.log("Error when loading the profile");
    }
  };
  const logout = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:8000/users/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.ok) {
      navigate("/");
    } else {
      console.log("Error when logout");
    }
  };
  return (
    <nav>
      <button
        onClick={logout}
        className="mt-4 ml-4 pb-2 pt-2 pl-4 pr-4 bg-green-700 text-white font-bold hover:bg-green-950 cursor-pointer"
      >
        Logout
      </button>
      <button onClick={profile}>Profile</button>
      <hr className="mt-2" />
    </nav>
  );
};

export default NavBar;
