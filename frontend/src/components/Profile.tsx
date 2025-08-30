import { useNavigate } from "react-router-dom";
import profileDefault from "../assets/avatardefault_92824.png";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
type FormData = {
  username: string;
  email: string;
  password: string;
};
const Profile = () => {
  const user = JSON.parse(localStorage.getItem("currentUser") ?? "{}");

  const [editProfile, setEditProfile] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    user.profile_picture || profileDefault
  );
  const [previewProfile, setPreviewProfile] = useState(profilePicture);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const deleteProfile = async () => {
    const response = await axios.delete("http://127.0.0.1:8000/users/delete", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.data.ok) {
      localStorage.clear();
      navigate("/", {
        state: { deleted: `User ${user.email} deleted successfully.` },
      });
    } else {
      console.log(response.data);
    }
  };

  const updateProfile = async (data: FormData) => {
    if (!data.password) {
      setError("password", {
        type: "manual",
        message: "Please confirm the password of the account",
      });
      setTimeout(
        () => setError("password", { type: "manual", message: "" }),
        3000
      );
      return;
    }
    const newProfilePicture = previewProfile;

    const response = await axios.patch(
      "http://localhost:8000/users/update",
      {
        username: data.username,
        email: data.email,
        password: data.password,
        profile_picture: newProfilePicture,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.ok) {
      navigate("/home");
      // localStorage.clear();
      // navigate("/", {
      //   state: { deleted: `User ${user.email} updated successfully.` },
      // });
      console.log(response.data);
    }
  };
  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-gray-300 w-80 border-r-3 shadow-lg">
      <form>
        <div className="flex flex-col p-5 rounded-lg w-[25vw]">
          {editProfile ? (
            <div>
              <p className="text-sm">
                Click the image to generate a new random profile picture
              </p>
              <img
                id="profile_picture"
                onClick={() =>
                  setPreviewProfile(
                    `https://picsum.photos/id/${Math.floor(
                      Math.random() * 1084
                    )}/1920/1080`
                  )
                }
                src={previewProfile}
                className="w-[250px] h-[250px] rounded-full object-cover hover:cursor-pointer hover:opacity-80"
                alt="Foto de usuário"
              />
            </div>
          ) : (
            <div>
              <img
                src={profilePicture}
                className="w-[250px] h-[250px] rounded-full object-cover"
                alt="Foto de usuário"
              />
            </div>
          )}

          {editProfile ? (
            <div>
              <label className="font-bold pl-1 " htmlFor="username">
                Username:{" "}
              </label>
              <input
                {...register("username")}
                id="username"
                name="username"
                className="mb-5"
                placeholder={user.username}
                onChange={(e) => e.target.value}
              />
              <label className="font-bold pl-1 " htmlFor="email">
                Email:{" "}
              </label>
              <input
                {...register("email")}
                id="email"
                name="email"
                className="mb-5"
                placeholder={user.email}
                onChange={(e) => e.target.value}
              />
              <label className="font-bold pl-1 " htmlFor="password">
                Password:{" "}
              </label>
              <input
                {...register("password")}
                id="password"
                name="password"
                className="mb-5"
                placeholder="Confirm your password"
              />
            </div>
          ) : (
            <div>
              <p className="mb-5">
                <b>Username:</b> {user.username}
              </p>
              <p>
                <b>Email:</b> {user.email}
              </p>
            </div>
          )}
          {errors.password && <p className="mb-4">{errors.password.message}</p>}
          {editProfile ? (
            <button
              onClick={handleSubmit(updateProfile)}
              className="pt-2 pb-2 pl-4 pr-4 mr-5 mb-5 mt-5  bg-green-700 text-white hover:bg-green-950 cursor-pointer"
              type="button"
            >
              Save
            </button>
          ) : (
            <button
              className="pt-2 pb-2 pl-4 pr-4 mr-5 mb-5 mt-5  bg-green-700 text-white hover:bg-green-950 cursor-pointer"
              type="button"
              onClick={() => setEditProfile(!editProfile)}
            >
              Edit Profile
            </button>
          )}

          {editProfile ? (
            <button
              className="pt-2 pb-2 pl-4 pr-4 mr-5 mb-5 bg-red-700 text-white hover:bg-red-950 cursor-pointer"
              type="button"
              onClick={() => setEditProfile(!editProfile)}
            >
              Cancel
            </button>
          ) : (
            <button
              className="pt-2 pb-2 pl-4 pr-4 mr-5 mb-5 bg-red-700 text-white hover:bg-red-950 cursor-pointer"
              type="button"
              onClick={deleteProfile}
            >
              Delete Account
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
