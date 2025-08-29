import { useLocation, useNavigate } from "react-router-dom";
import profilePicture from "../assets/avatardefault_92824.png";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
type FormData = {
  username: string;
  email: string;
  password: string;
};
const Profile = () => {
  const location = useLocation();
  const data = location.state?.data;
  const [editProfile, setEditProfile] = useState(false);
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
        state: { deleted: `User ${data.email} deleted successfully.` },
      });
    } else {
      console.log(response.data);
    }
  };
  const updateProfile = async (data: FormData) => {
    const response = await axios.patch(
      "http://localhost:8000/users/update",
      {
        username: data.username,
        email: data.email,
        password: data.password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.ok) {
      window.location.reload();
    }
  };
  return (
    <div className="m-8 flex flex-col">
      <div>
        <form>
          {data.profile ? (
            data.profile_image
          ) : (
            <img
              className="w-50 h-50 border-2 hover:cursor-pointer hover:opacity-80"
              src={profilePicture}
              alt="Foto de usuário"
            />
          )}
          {editProfile ? (
            <div>
              <label className="font-bold" htmlFor="username">
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                name="username"
                className="w-full mb-5"
                placeholder={data.username}
                onChange={(e) => e.target.value}
              />
              <label className="font-bold" htmlFor="email">
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                name="email"
                className="w-full mb-5"
                placeholder={data.email}
                onChange={(e) => e.target.value}
              />
              <label className="font-bold" htmlFor="password">
                Password
              </label>
              <input
                {...register("password")}
                id="password"
                name="password"
                className="w-full mb-5"
                placeholder="Confirm your password"
              />
            </div>
          ) : (
            <div>
              <p className="font-bold">Username</p>
              <h1 className="w-full mb-5">{data.username}</h1>
              <p className="font-bold">Email</p>
              <h1 className="w-full mb-5">{data.email}</h1>
            </div>
          )}
          {editProfile ? (
            <div>
              <button
                onClick={handleSubmit(updateProfile)}
                className="pt-2 pb-2 pl-4 pr-4 mr-5 bg-green-700 text-white hover:bg-green-950 cursor-pointer"
                type="button"
              >
                Save
              </button>
              <button
                className="pt-2 pb-2 pl-4 pr-4 bg-red-700 text-white hover:bg-red-950 cursor-pointer"
                type="button"
                onClick={() => setEditProfile(!editProfile)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <button
                className="pt-2 pb-2 pl-4 pr-4 mr-5 bg-green-700 text-white hover:bg-green-950 cursor-pointer"
                type="button"
                onClick={() => setEditProfile(!editProfile)}
              >
                Edit Profile
              </button>
              <button
                className="pt-2 pb-2 pl-4 pr-4 bg-red-700 text-white hover:bg-red-950 cursor-pointer"
                type="button"
                onClick={deleteProfile}
              >
                Delete Account
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
