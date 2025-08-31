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
      navigate("/");
    } else {
      console.log("Error when logout");
    }
  };
  return (
    <nav>
      <div className="flex v-screen justify-between">
        <img
          onClick={profile}
          className="mt-2 ml-4 w-[50px] h-[50px] rounded-full hover:opacity-80 cursor-pointer"
          src={profilePicture}
          alt="Profile picture"
        />
        <p className="my-auto font-light scale-250 mt-5 font-storyscript">
          Momentum
        </p>
        <button
          onClick={logout}
          className="mt-4 mb-1 mr-4 pl-4 pr-4 bg-green-700 text-white font-bold hover:bg-green-950 cursor-pointer"
        >
          Logout
        </button>
      </div>
      <hr className="mt-2 border-1" />
    </nav>
  );
};

export default NavBar;
