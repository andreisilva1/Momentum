import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

type FormData = {
  title: string;
  tag: string;
  limit_date: Number;
};

const CreateTask = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  const [name, setName] = useState("");
  const location = useLocation();
  const tags = ["Commom", "Important", "Urgent"];
  const board_id = location.state?.board_id;
  const board_name = location.state?.board_name;

  const handleTask = () => {
    navigate("/home");
  };
  const create = async (data: FormData) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/task/create?board_id=${board_id}&tag=${data.tag.toLowerCase()}&limit_date=${
          data.limit_date
        }`,
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
        setName(response.data.task.title);
        setSuccessMsg(true);
      }
    } catch (error: any) {
      setError("title", {
        type: "manual",
        message: "Error when creating the task. Try again after a few moments.",
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
          <label htmlFor="tag">Tag</label>
          <select
            {...register("tag", { required: "A tag is required." })}
            className="shadow-lg p-2 mb-4"
            name="tag"
            id="tag"
            defaultValue=""
          >
            <option value="" disabled>
              Select a tag
            </option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <label htmlFor="tag">Limit date (in days) </label>
          <input
            {...register("limit_date", {
              required: "A limit date is required.",
            })}
            min={0}
            className="shadow-lg p-2 mb-4"
            type="number"
          />

          <button
            onClick={handleSubmit(create)}
            className="font-bold text-white bg-green-700 pl-4 pr-4 pb-2 pt-2 mb-2 rounded-lg hover:bg-green-950 cursor-pointer"
          >
            Create Task
          </button>
        </div>
        {successMsg && (
          <p
            className="hover:underline hover:text-blue-800 cursor-pointer"
            onClick={() => handleTask()}
          >
            Task "{name}" created successfully to board "{board_name}". Go to
            main menu here.
          </p>
        )}
        {errors.title && <p>{errors.title.message}</p>}
        {errors.tag && <p>{errors.tag.message}</p>}
        {errors.limit_date && <p>{errors.limit_date.message}</p>}
      </form>
    </div>
  );
};

export default CreateTask;
