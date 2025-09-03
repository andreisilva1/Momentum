import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";

type FormCreateTaskData = {
  title: string;
  tag: string;
  limit_date: Number;
};

const apiUrl = import.meta.env.VITE_API_URL;

const Board = () => {
  const location = useLocation();
  const board = location.state?.board;
  const participants = location.state?.participants;
  const [options, setOptions] = useState({
    tasks: true,
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
        `${apiUrl}/task/create?board_id=${
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
        setTrigger(trigger + 1);
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

  const [editBoardTitleOption, setEditBoardTitleOption] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [userToAttachTheTask, setUserToAttachTheTask] = useState<any>("");
  const [msgWhenAttachingTask, setMsgWhenAttachingTask] = useState("");
  const [userSelector, setUserSelector] = useState(false);
  const user = JSON.parse(localStorage.getItem("currentUser") ?? "null");
  const [createTask, setCreateTask] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [deleteMsg, setDeleteMsg] = useState(false);
  const [changeMsg, setChangeMsg] = useState(false);
  const [changeBoardTitleMsg, setChangeBoardTitleMsg] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [taskStatus, setTaskStatus] = useState("");
  const [deletePasswordConfirmation, setDeletePasswordConfirmation] =
    useState(false);
  const [taskEditingID, setTaskEditingID] = useState();
  const [passwordConfirm, setConfirmPassword] = useState("");
  const [searchTask, setSearchTask] = useState("");

  const editNewBoardTitle = async () => {
    try {
      if (newBoardTitle.trim() === "") {
        setChangeBoardTitleMsg("Title empty. Name unchanged.");
        setTimeout(() => {
          setChangeBoardTitleMsg("");
        }, 3000);
        return;
      }
      const response = await axios.patch(
        `${apiUrl}/board/update?board_id=${board.id}&title=${newBoardTitle}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == 200) {
        setChangeBoardTitleMsg(
          "Title successfully edited. To guarantee, exit and enter the board again."
        );
        setTimeout(() => {
          setChangeBoardTitleMsg("");
        }, 3000);
      }
    } catch (error: any) {
      if (error.response.status == 401) {
        setChangeBoardTitleMsg(
          "A error occurred. Try again after a few moments."
        );

        setTimeout(() => {
          setChangeBoardTitleMsg("");
        }, 3000);
      }
    }
  };

  const handleTasks = async () => {
    const response = await axios.get(
      `${apiUrl}/board/get_all_tasks?board_id=${board.id}`,
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
  useEffect(() => {
    handleTasks();
  }, [trigger]);

  const deleteTask = async (task_id: any) => {
    const response = await axios.delete(
      `${apiUrl}/task/delete?task_id=${task_id}&password=${passwordConfirm}`,
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
      }, 1000);
    }
  };

  const handleChangeStatus = async (
    task_id: any,
    task_tag: any,
    status: string
  ) => {
    const response = await axios.patch(
      `${apiUrl}/task/update?task_id=${task_id}&task_status=${status}&limit_date=0&tag=${task_tag}`,
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
      }, 1000);
    } else {
      console.log("Something went wrong");
    }
  };

  const finishTask = async (task_id: string) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/task/finish_task?task_id=${task_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == 200) {
        //Success
        console.log("Successfully finished.");
      }
    } catch (error: any) {
      //Error
      console.log("A error occurred.");
    }
  };

  const attachTaskToUser = async (task: any) => {
    try {
      const response = await axios.post(
        `${apiUrl}/task/attach_task?task_id=${task.id}&user_email=${userToAttachTheTask.email}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == 200) {
        setMsgWhenAttachingTask(
          `Task ${task.title} attached to ${userToAttachTheTask.username}`
        );
      }
    } catch (error: any) {
      if (error.response.status == 404) {
        setMsgWhenAttachingTask(
          "A error occurred. Try again after a few moments."
        );
      }
    } finally {
      setTimeout(() => {
        setMsgWhenAttachingTask("");
      }, 3000);
    }
  };
  return (
    <div className="flex-col items-center h-screen bg-white">
      <div className="p-5">
        {editBoardTitleOption ? (
          <input
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="text-titles border-2 rounded-lg p-2"
            placeholder={board.title}
          />
        ) : (
          <h1 className="text-titles mb-0 p-2">{board.title}</h1>
        )}
        {changeBoardTitleMsg && <p className="mb-4">{changeBoardTitleMsg}</p>}
        {board.creator_id === user.id && (
          <button
            onClick={
              editBoardTitleOption
                ? () => {
                    editNewBoardTitle(),
                      setEditBoardTitleOption(!editBoardTitleOption);
                  }
                : () => setEditBoardTitleOption(!editBoardTitleOption)
            }
            className="btn-selector mt-0 hover:btn-selected"
          >
            {editBoardTitleOption ? "Confirm the edit" : "Edit Board title"}
          </button>
        )}

        <nav>
          <div className="options-div">
            <button
              onClick={() => {
                handleTasks(),
                  setOptions({
                    tasks: true,
                    details: false,
                  });
              }}
              className="text-tables"
            >
              Tasks
            </button>
            <p className="divider">|</p>
            <button
              onClick={() => {
                setOptions({
                  tasks: false,
                  details: true,
                });
              }}
              className="text-tables"
            >
              Details
            </button>
          </div>
        </nav>
        <div>
          {createTask && (
            <div className="flex shadow-4xl z-1 justify-center items-center border-white border-b-1">
              <form>
                <div className="flex flex-col w-full p-5 text-white">
                  <label className="label-text" htmlFor="title">
                    Title
                  </label>
                  <input
                    {...register("title", { required: "A name is required." })}
                    id="title"
                    name="title"
                    type="text"
                    className="input-sw-mg text-black"
                    placeholder="Enter the name"
                  />
                  <label className="label-text" htmlFor="tag">
                    Tag
                  </label>
                  <select
                    {...register("tag", { required: "A tag is required." })}
                    className="input-sw-mg text-black"
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
                  <label className="label-text" htmlFor="tag">
                    Limit date (default = 15 days from today){" "}
                  </label>
                  <input
                    {...register("limit_date", {
                      required: "A limit date is required.",
                    })}
                    min={0}
                    className="input-sw-mg"
                    type="number"
                  />

                  <button
                    onClick={handleSubmit(create)}
                    className="font-bold text-white bg-[#b1132b] pl-4 pr-4 pb-2 pt-2 mb-2 rounded-lg hover:bg-[#d82f49] cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
                {successMsg && (
                  <p className="text-[#420C14] mb-3 font-medium">
                    Task "{name}" created successfully to board "{board.title}".{" "}
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
                className="btn-selector"
              >
                {createTask ? "Cancel" : "Create new task"}
              </button>
              <button
                onClick={() => setTaskStatus("")}
                className={taskStatus === "" ? "btn-selected" : "btn-selector"}
              >
                All tasks
              </button>
              <button
                onClick={() => setTaskStatus("not started")}
                className={
                  taskStatus === "not started" ? "btn-selected" : "btn-selector"
                }
              >
                Not started
              </button>
              <button
                onClick={() => setTaskStatus("in progress")}
                className={
                  taskStatus === "in progress" ? "btn-selected" : "btn-selector"
                }
              >
                In progress
              </button>
              <button
                onClick={() => setTaskStatus("finished")}
                className={
                  taskStatus === "finished" ? "btn-selected" : "btn-selector"
                }
              >
                Finished
              </button>
              <input
                className="shadow-lg p-2 w-full"
                placeholder="Search by name or classification (commom, important, urgent) here"
                onChange={(e) => setSearchTask(e.target.value)}
                type="text"
              />
              {msgWhenAttachingTask && <p>{msgWhenAttachingTask}</p>}
              {changeMsg && <p>Task status successfully updated.</p>}
              {deleteMsg && <p>Task successfully deleted.</p>}

              {tasks
                .filter((task) => {
                  const matchesStatus =
                    taskStatus === "" || task.status === taskStatus;

                  const matchesSearch =
                    searchTask === "" ||
                    task.title
                      .toLowerCase()
                      .includes(searchTask.toLowerCase()) ||
                    task.tag.toLowerCase().includes(searchTask.toLowerCase());

                  return matchesStatus && matchesSearch;
                })
                .map((task) => (
                  <div key={task.id} className="task-div">
                    <div className="flex flex-col">
                      <h1 className="task-attr-color">{task.title}</h1>
                      <p className="task-attr-color text-sm font-medium mb-1">
                        Status: {task.status}
                      </p>
                      <p
                        className={
                          task.tag === "urgent"
                            ? "text-sm font-bold text-red-600 uppercase"
                            : "text-sm font-bold text-green-600"
                        }
                      >
                        Classification: {task.tag}
                      </p>
                      <p
                        className={
                          new Date() >
                          new Date(
                            new Date(task.limit_date).getTime() -
                              3 * 24 * 60 * 60 * 1000
                          )
                            ? "text-sm font-bold mt-2 text-red-600 uppercase"
                            : "text-green-800 text-sm font-medium mt-2"
                        }
                      >
                        Limit date:{" "}
                        {new Date(task.limit_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-3 font-medium">
                        Attached to:{" "}
                        {task.users_attached.map((user: any) => (
                          <li key={user.id}>{user.username}</li>
                        ))}
                      </p>
                      {task.finished_at && (
                        <p className="text-sm">
                          Finished at:{" "}
                          {new Date(task.finished_at).toLocaleString()}
                        </p>
                      )}
                      {user.id == board.creator_id && (
                        <div>
                          {userSelector ? (
                            <div>
                              <select
                                value={userToAttachTheTask}
                                name="participant"
                                id="participant"
                                className="pb-2 pt-2 border-1 mr-2  font-light"
                                onChange={(e) => {
                                  const selected = participants.find(
                                    (p: any) => p.username === e.target.value
                                  );
                                  setUserToAttachTheTask(selected);
                                }}
                              >
                                <option
                                  className="text-gray-700 font-light"
                                  disabled
                                  value=""
                                >
                                  Select a participant
                                </option>
                                {participants
                                  .filter(
                                    (participant: any) =>
                                      !task.users_attached.some(
                                        (user: any) => user.id == participant.id
                                      )
                                  )
                                  .map((participant: any) => (
                                    <option
                                      key={participant.id}
                                      value={participant.username}
                                    >
                                      {participant.username}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => attachTaskToUser(task)}
                                className="btn-selector mt-2"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setUserSelector(false)}
                                className="btn-selector mt-2"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setUserSelector(true)}
                              className="btn-selector mt-2"
                            >
                              Attach a user to this task
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {(user.id == task.creator_id ||
                      user.id == board.creator_id ||
                      task.users_attached.some(
                        (user_attached: any) => user_attached.id == user.id
                      )) && (
                      <div>
                        {deletePasswordConfirmation &&
                        taskEditingID === task.id ? (
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
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              type="password"
                              placeholder="Confirm your password"
                            />
                          </div>
                        ) : (
                          <div>
                            {(user.id == task.creator_id ||
                              user.id == board.creator_id) && (
                              <button
                                onClick={() => (
                                  setDeletePasswordConfirmation(
                                    !deletePasswordConfirmation
                                  ),
                                  setTaskEditingID(task.id)
                                )}
                                className="delete-button"
                              >
                                Delete the task
                              </button>
                            )}

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
                                  onClick={() => {
                                    finishTask(task.id),
                                      handleChangeStatus(
                                        task.id,
                                        task.tag,
                                        "finished"
                                      );
                                  }}
                                  className="bg-green-700 pl-4 pr-4 pt-2 pb-2 text-white mb-2 hover:bg-green-950 cursor-pointer"
                                >
                                  Finish the task
                                </button>
                              </div>
                            )}
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
