import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/pexels-seven11nash-380769.jpg";
import { useForm } from "react-hook-form";

type FormData = {
  title: string;
};

const apiUrl = import.meta.env.VITE_API_URL;

const Home = () => {
  const [organizations, setOrganizations] = useState([]);
  const handleOrganization = async (organization: any) => {
    navigate("/organization", { state: organization });
  };

  const [createOrganization, setCreateOrganization] = useState(false);
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();
  const [trigger, setTrigger] = useState(0);
  const [newOrganization, setNewOrganization] = useState();
  const [name, setName] = useState("");
  const handleCreateOrganization = async (organization: any) => {
    navigate("/organization", { state: organization });
  };
  const create = async (data: FormData) => {
    try {
      const response = await axios.post(
        `${apiUrl}/organization/create`,
        {
          title: data.title,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.ok) {
        setNewOrganization(response.data.organization);
        setName(response.data.organization.title);
        setTrigger(trigger + 1);
        setSuccessMsg(true);
      }
    } catch (error: any) {
      setError("title", {
        type: "manual",
        message: "You already create a organization with this name.",
      });
      setTimeout(() => {
        setError("title", { type: "manual", message: "" });
      }, 3000);
    }
  };
  const get_organizations = async () => {
    const organizations = await axios.get(`${apiUrl}/organization/get_all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (organizations.data) {
      setOrganizations(organizations.data);
    }
  };
  useEffect(() => {
    get_organizations();
  }, [trigger]);

  return (
    <div className="bg-black/25">
      <NavBar />
      <div className="w-[30vw] h-screen pr-2 shadow-lg bg-black/15 backdrop-blur-sm z-50">
        <div className="flex flex-col justify-center items-center">
          <h1
            className="m-2 font-bold text-2xl text-white"
            style={{
              width: "29vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Organizations
          </h1>
          <button
            onClick={() => setCreateOrganization(true)}
            className="btn-selector pt-2 pb-2 mt-0"
            style={{
              width: "25vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Create a new organization
          </button>
        </div>
        <hr className="mb-2 text-white ml-2" />
        {organizations.map((organization: any) => (
          <li
            className="m-2 text-white font-bold text-sm hover:opacity-85 cursor-pointer"
            style={{
              width: "30vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={() => handleCreateOrganization(organization)}
            key={organization.id}
          >
            {organization.title}
          </li>
        ))}
      </div>
      {createOrganization && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <form>
            <div className="flex flex-col bg-white border-2 w-full p-5">
              <label className="font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                {...register("title", { required: "A name is required." })}
                id="title"
                name="title"
                type="text"
                className="shadow-lg p-2 mb-4"
                placeholder="Enter the name"
              />
              <button
                onClick={handleSubmit(create)}
                className="btn-selector pl-4 pr-4 pb-2 pt-2 mb-0 mx-auto"
              >
                Create Organization
              </button>
              <button
                onClick={() => {
                  setCreateOrganization(false), setSuccessMsg(false);
                }}
                className="btn-selector pl-4 pr-4 pb-2 pt-2 mb-2 mt-2 mx-auto"
              >
                Cancel
              </button>
            </div>
            {successMsg && (
              <p
                className="text-white font-bold backdrop-blur-2xl hover:underline hover:text-gray-300 cursor-pointer"
                onClick={() => handleOrganization(newOrganization)}
              >
                Organization "{name}" created successfully, to access already,
                click here
              </p>
            )}
            {errors.title && (
              <p className="text-white font-bold backdrop-blur-2xl">
                {errors.title.message}
              </p>
            )}
          </form>
        </div>
      )}
      <img
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        src={backgroundImage}
        alt=""
      />
    </div>
  );
};

export default Home;
