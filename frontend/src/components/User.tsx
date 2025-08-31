import { useForm } from "react-hook-form";
import "./App.css";
import backgroundImage from "../assets/pexels-fauxels-3183197.jpg";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
const User = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();
  const location = useLocation();
  const deletedUser = location.state?.deleted;
  const [userDeletedMessage, setUserDeletedMessage] = useState<string | null>(
    deletedUser || null
  );
  const [loginPage, setLoginPage] = useState(false);
  useEffect(() => {
    if (userDeletedMessage) {
      const timer = setTimeout(() => {
        setUserDeletedMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userDeletedMessage]);
  const login = async (data: FormData) => {
    const params = new URLSearchParams();
    params.append("username", data.email);
    params.append("password", data.password);
    const userLogin = await axios.post(
      "http://localhost:8000/users/login",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (userLogin.data.ok) {
      localStorage.setItem("token", userLogin.data.access_token);
      const response = await axios.get("http://localhost:8000/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data) {
        localStorage.setItem("currentUser", JSON.stringify(response.data));
        navigate("/home");
      } else {
        console.log("Error when loading the profile");
      }
      
    } else {
      setError("confirmPassword", {
        type: "manual",
        message: "A error occurred. Try again after a few moments.",
      });
      setTimeout(() => {
        setError("confirmPassword", {
          type: "manual",
          message: "",
        });
      }, 3000);
    }
  };
  const signup = async (data: FormData) => {
    if (data.password === data.confirmPassword) {
      const user = await axios.get(
        `http://localhost:8000/users/?email=${data.email}`
      );
      console.log(user.data);
      if (!user.data.ok) {
        const response = await axios.post(
          "http://localhost:8000/users/signup",
          {
            username: data.username,
            email: data.email,
            password: data.password,
          },
          {
            headers: {
              Authorization: "application/json",
            },
          }
        );

        if (response.data.detail.ok) {
          login(data);
        }
      } else {
        setError("email", {
          type: "manual",
          message: "Already exists a user with this email. Try another.",
        });
        setTimeout(() => {
          setError("email", { type: "manual", message: "" });
        }, 3000);
      }
    } else {
      setError("confirmPassword", {
        type: "manual",
        message: "The passwords need to match eachother",
      });
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex items-center justify-center h-screen bg-black overflow-hidden">
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={backgroundImage}
          className="absolute inset-0 w-full h-full object-cover blur-xs z-0 scale-140 opacity-80"
          alt="Foto de fauxels: https://www.pexels.com/pt-br/foto/foto-de-pessoas-fazendo-apertos-de-mao-3183197/"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <p
            className="text-center text-white scale-325 font-medium text-shadow-lg"
            style={{
              textShadow: "2px 2px 4px rgba(1,1,1,1)",
            }}
          >
            Organize{" "}
            <span
              className="text-transparent font-storyscript"
              style={{
                WebkitTextStroke: "0.2px white",
              }}
            >
              your flow
            </span>
            , achieve{" "}
            <span
              className="text-transparent font-storyscript"
              style={{
                WebkitTextStroke: "0.2px white",
              }}
            >
              your goals
            </span>
            .
            <br />
          </p>
        </div>
      </div>
      <div className="flex shadow-4xl w-[35vw] h-screen z-1 bg-[white] justify-center items-center shadow-lg">
        <form>
          <div className="flex flex-col font-bold text-[#164636]">
            {userDeletedMessage && (
              <p className="text-sm font-light">{userDeletedMessage}</p>
            )}
            {loginPage ? (
              <h1 className="mb-5 mt-3 mx-auto text-2xl">Login</h1>
            ) : (
              <h1 className="mb-5 mt-3 mx-auto text-2xl">Create a account</h1>
            )}

            {loginPage ? (
              <div></div>
            ) : (
              <div className="flex flex-col font-bold text-[#164636]">
                <label htmlFor="username">Username</label>
                <input
                  {...register("username", { required: "Username required" })}
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  className="p-2 rounded-lg shadow-2xl border-2 mt-2 mb-2"
                />
                {errors.username && (
                  <p className="font-light mb-2 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
            )}

            <label htmlFor="email">E-mail</label>
            <input
              {...register("email", { required: "E-mail required" })}
              type="text"
              id="email"
              name="email"
              placeholder="Enter your e-mail"
              className="p-2 rounded-lg shadow-2xl border-2 mt-2 mb-2"
            />
            {errors.email && (
              <p className="font-light mb-2 text-sm">{errors.email.message}</p>
            )}
            <label htmlFor="password">Password</label>
            <input
              {...register("password", { required: "Password required" })}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              className="p-2 rounded-lg shadow-2xl border-2 mt-2 mb-2"
            />
            {errors.password && (
              <p className="font-light mb-2 text-sm">
                {errors.password.message}
              </p>
            )}

            {loginPage ? (
              <div></div>
            ) : (
              <div className="flex flex-col font-bold text-[#164636]">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  {...register("confirmPassword", {
                    required: "Confirm Password required",
                  })}
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="p-2 rounded-lg shadow-2xl border-2 mt-2 mb-2"
                />
              </div>
            )}

            {errors.confirmPassword && (
              <p className="font-light mb-2 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}

            <button
              type="button"
              className="pt-2 pb-2 pl-4 pr-4 bg-red-700 text-white mb-2 hover:bg-red-950 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Show Password" : "Hide Password"}
            </button>
            {loginPage ? (
              <button
                onClick={handleSubmit(login)}
                className="pt-2 pb-2 pl-4 pr-4 bg-green-700 text-white mb-5 hover:bg-green-950 cursor-pointer"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleSubmit(signup)}
                className="pt-2 pb-2 pl-4 pr-4 bg-blue-700 text-white mb-2 hover:bg-blue-950 cursor-pointer"
              >
                Register
              </button>
            )}

            {loginPage ? (
              <button
                onClick={() => setLoginPage(!loginPage)}
                type="button"
                className="font-light text-sm hover:text-[#0e3629] hover:underline hover:cursor-pointer"
              >
                Don't have a account yet? Click here to create
              </button>
            ) : (
              <button
                onClick={() => setLoginPage(!loginPage)}
                type="button"
                className="font-light text-sm hover:text-[#0e3629] hover:underline hover:cursor-pointer"
              >
                Already have a account? Click here to login
              </button>
            )}

            <button
              type="button"
              className="font-light text-sm hover:text-[#0e3629] hover:underline hover:cursor-pointer"
            >
              Forgot your password? Click here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default User;
