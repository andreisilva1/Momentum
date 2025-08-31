import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

type FormData = {
  title: string;
};

const CreateBoard = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();
  const [newBoard, setNewBoard] = useState();
  const [name, setName] = useState("");
  const location = useLocation();
  const organization_id = location.state as Record<string, any>;

  const handleBoard = async (board: any) => {
    navigate("/board", { state: board });
  };
  const create = async (data: FormData) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/board/create?organization_id=${organization_id}`,
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
        setNewBoard(response.data.board);
        setName(response.data.board.title);
        setSuccessMsg(true);
      }
    } catch (error: any) {
      console.log(organization_id);
      setError("title", {
        type: "manual",
        message:
          "Error when creating the board. Try again after a few moments.",
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
            Create Board
          </button>
        </div>
        {successMsg && (
          <p
            className="hover:underline hover:text-blue-800 cursor-pointer"
            onClick={() => handleBoard(newBoard)}
          >
            Board {name} created successfully, to access already, click here
          </p>
        )}
        {errors.title && <p>{errors.title.message}</p>}
      </form>
    </div>
  );
};

export default CreateBoard;
