import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

type FormCreateTaskData = {
  title: string;
  tag: string;
  limit_date: Number;
};
const Board = () => {
  const location = useLocation();
  const board = location.state;
  const [options, setOptions] = useState({
    tasks: false,
    details: false,
  });
  const [successMsg, setSuccessMsg] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormCreateTaskData>();

  const [name, setName] = useState("");
  const tags = ["Commom", "Important", "Urgent"];

  const create = async (data: FormCreateTaskData) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/task/create?board_id=${
          board.id
        }&tag=${data.tag.toLowerCase()}&limit_date=${data.limit_date}`,
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
  const [createTask, setCreateTask] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [deleteMsg, setDeleteMsg] = useState(false);
  const [changeMsg, setChangeMsg] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [deletePasswordConfirmation, setDeletePasswordConfirmation] =
    useState(false);
  const [taskEditingID, setTaskEditingID] = useState();
  const [passwordConfirm, setConfirmPassword] = useState("");

  const handleTasks = async () => {
    const response = await axios.get(
      `http://localhost:8000/board/get_all_tasks?board_id=${board.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data.ok) {
      setTasks(response.data.tasks);
    } else {
      console.log("Something went wrong...");
    }
  };

  const deleteTask = async (task_id: any) => {
    console.log(task_id);
    console.log(passwordConfirm);
    const response = await axios.delete(
      `http://localhost:8000/task/delete?task_id=${task_id}&password=${passwordConfirm}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data.ok) {
      setDeleteMsg(true);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleChangeStatus = async (
    task_id: any,
    task_tag: any,
    status: string
  ) => {
    const response = await axios.patch(
      `http://localhost:8000/task/update?task_id=${task_id}&task_status=${status}&limit_date=0&tag=${task_tag}`,
      {
        title: "",
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data.ok) {
      setChangeMsg(true);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.log("Something went wrong");
    }
  };

  return (
    <div className="flex-col items-center h-screen">
      <div className="border-2 p-5 m-2">
        <h1 className="w-full font-bold text-2xl mb-5">{board.title}</h1>
        <nav>
          <div className="flex v-screen justify-between p-1 border-2">
            <button
              onClick={() => {
                handleTasks(),
                  setOptions({
                    tasks: true,
                    details: false,
                  });
              }}
              className="mx-auto font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Tasks
            </button>
            <p>|</p>
            <button
              onClick={() => {
                setOptions({
                  tasks: false,
                  details: true,
                });
              }}
              className="mx-auto font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Details
            </button>
          </div>
        </nav>
        <div>
          {createTask && (
            <div className="flex shadow-4xl z-1 bg-[white] justify-center items-center shadow-lg">
              <form>
                <div className="flex flex-col w-full p-5">
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
                    className="hover:underline hover:text-blue-750"
                    onClick={() => window.location.reload()}
                  >
                    Task "{name}" created successfully to board "{board.title}".
                    Reload the page or click here.
                  </p>
                )}
                {errors.title && <p>{errors.title.message}</p>}
                {errors.tag && <p>{errors.tag.message}</p>}
                {errors.limit_date && <p>{errors.limit_date.message}</p>}
              </form>
            </div>
          )}
          {options.tasks && (
            <div>
              <button
                onClick={() => setCreateTask(!createTask)}
                className="bg-green-700 font-bold pl-2 pr-2 pt-1 pb-1 mr-3 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-green-950 cursor-pointer"
              >
                {createTask ? "Cancel" : "Create new task"}
              </button>
              <button
                onClick={() => setTaskStatus("")}
                className="bg-orange-700 font-bold pl-2 pr-2 pt-1 pb-1 mr-3 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-orange-950 cursor-pointer"
              >
                All tasks
              </button>
              <button
                onClick={() => setTaskStatus("not started")}
                className="bg-blue-700 font-bold pl-2 pr-2 pt-1 pb-1 mr-3 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-blue-950 cursor-pointer"
              >
                Not started
              </button>
              <button
                onClick={() => setTaskStatus("in progress")}
                className="bg-yellow-700 font-bold pl-2 pr-2 pt-1 pb-1 mr-3 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-yellow-950 cursor-pointer"
              >
                In progress
              </button>
              <button
                onClick={() => setTaskStatus("finished")}
                className="bg-pink-700 font-bold pl-2 pr-2 pt-1 pb-1 mr-3 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-pink-950 cursor-pointer"
              >
                Finished
              </button>

              {changeMsg && <p>Task status successfully updated.</p>}
              {deleteMsg && <p>Task successfully deleted.</p>}

              {tasks
                .filter(
                  (task) => taskStatus === "" || task.status === taskStatus
                )
                .map((task) => (
                  <div
                    key={task.id}
                    className="font-bold flex mt-2 justify-between items-center border-2 p-2"
                  >
                    <div className="flex flex-col">
                      <h1>{task.title}</h1>
                      <p className="text-sm font-medium">
                        Status: {task.status}
                      </p>
                      <h5
                        className={
                          task.tag === "urgent"
                            ? "text-sm font-bold text-red-700 uppercase"
                            : "text-sm font-bold text-blue-700"
                        }
                      >
                        Classification: {task.tag}
                      </h5>
                      <p
                        className={
                          new Date() <
                          new Date(
                            new Date(task.limit_date).getTime() -
                              3 * 24 * 60 * 60 * 1000
                          )
                            ? "text-sm font-bold mt-4 text-green-700"
                            : "text-sm font-bold mt-4 text-red-700"
                        }
                      >
                        Limit date:{" "}
                        {new Date(task.limit_date).toLocaleDateString()}
                      </p>
                    </div>

                    {deletePasswordConfirmation && taskEditingID === task.id ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="bg-red-700 pl-4 pr-4 mb-2 pt-2 pb-2 text-white hover:bg-red-950 cursor-pointer"
                        >
                          Confirm Deletion
                        </button>
                        <button
                          onClick={() =>
                            setDeletePasswordConfirmation(
                              !deletePasswordConfirmation
                            )
                          }
                          className="bg-blue-700 pl-4 pr-4 pt-2 pb-2 text-white hover:bg-blue-950 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <input
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          type="text"
                          placeholder="Confirm your password"
                        />
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => (
                            setDeletePasswordConfirmation(
                              !deletePasswordConfirmation
                            ),
                            setTaskEditingID(task.id)
                          )}
                          className="bg-red-700 pl-4 pr-4 pt-2 pb-2 text-white mb-2 hover:bg-red-950 cursor-pointer"
                        >
                          Delete the task
                        </button>

                        {task.status === "not started" && (
                          <div className="flex flex-col">
                            <button
                              onClick={() =>
                                handleChangeStatus(
                                  task.id,
                                  task.tag,
                                  "in%20progress"
                                )
                              }
                              className="bg-green-700 pl-4 pr-4 pt-2 pb-2 text-white mb-2 hover:bg-green-950 cursor-pointer"
                            >
                              Change to in progress
                            </button>
                          </div>
                        )}
                        {task.status === "in progress" && (
                          <div className="flex flex-col">
                            <button
                              onClick={() =>
                                handleChangeStatus(
                                  task.id,
                                  task.tag,
                                  "finished"
                                )
                              }
                              className="bg-green-700 pl-4 pr-4 pt-2 pb-2 text-white mb-2 hover:bg-green-950 cursor-pointer"
                            >
                              Finish the task
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div>
          {options.details && (
            <h1>
              Created at: {new Date(board.created_at).toLocaleDateString()}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
