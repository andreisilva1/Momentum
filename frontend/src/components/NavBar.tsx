import axios from "axios";
import "./App.css";
import { useNavigate } from "react-router-dom";
import profileDefault from "../assets/avatardefault_92824.png";

const NavBar = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");
  let profilePicture = profileDefault;
  if (user !== null) {
    profilePicture = JSON.parse(user).profile_picture;
  }
  const profile = async () => {
    navigate("/profile");
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
      localStorage.clear();
      navigate("/");
    } else {
      console.log("Error when logout");
    }
  };
  return (
    <nav>
      <div className="flex justify-between bg-[#420C14]">
        <img
          onClick={profile}
          className="ml-4 w-[50px] h-[50px] rounded-full hover:opacity-80 cursor-pointer"
          src={profilePicture}
          alt="Profile picture"
        />
        <p className="my-auto text-white font-bold text-shadow-2xs scale-250">
          M o m e n t u m
        </p>
        <button
          onClick={logout}
          className="btn-selector bg-white text-[#420C14]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
