import axios, { type HttpStatusCode } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type FormData = {
  title: string;
};
const CreateOrganization = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  const [newOrganization, setNewOrganization] = useState();
  const [name, setName] = useState("");
  const handleOrganization = async (organization: any) => {
    navigate("/organization", { state: organization });
  };
  const create = async (data: FormData) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/organization/create",
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

  return (
    <div className="flex shadow-4xl h-screen z-1 bg-[white] justify-center items-center shadow-lg">
      <form>
        <div className="flex flex-col border-2 w-full p-5">
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
            className="font-bold text-white bg-green-700 pl-4 pr-4 pb-2 pt-2 mb-2 rounded-lg hover:bg-green-950 cursor-pointer"
          >
            Create Organization
          </button>
        </div>
        {successMsg && (
          <p
            className="hover:underline hover:text-blue-800 cursor-pointer"
            onClick={() => handleOrganization(newOrganization)}
          >
            Organization {name} created successfully, to access already, click
            here
          </p>
        )}
        {errors.title && <p>{errors.title.message}</p>}
      </form>
    </div>
  );
};
export default CreateOrganization;
