import axios from "axios";
import "./App.css";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("currentUser");
  let name = null;

  if (user !== null) {
    name = JSON.parse(user).username;
  }
  let profilePicture = null;
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
      <div className="flex w-full h-[60px] bg-[#420C14]">
        <div className="bg-[#420C14] flex items-center">
          {profilePicture ? (
            <img
              onClick={profile}
              className="ml-4 w-[50px] h-[50px] rounded-full hover:opacity-80 cursor-pointer"
              src={profilePicture}
              alt="Profile picture"
            />
          ) : (
            <div
              onClick={profile}
              className="flex flex-col justify-center items-center ml-4 w-[50px] h-[50px] bg-black  rounded-full hover:opacity-80 cursor-pointer"
            >
              <p className="font-bold text-white text-sm">Profile</p>
            </div>
          )}
          <p className="ml-2 text-white font-bold">{name}</p>
        </div>
        <div className="flex flex-10">
          <p className="text-2xl my-auto mx-auto text-white font-bold text-shadow-2xs">
            Momentum
          </p>
          <button
            onClick={logout}
            className="btn-selector bg-white text-[#420C14]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
