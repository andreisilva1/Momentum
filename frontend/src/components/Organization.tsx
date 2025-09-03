import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

type FormCreateBoardData = {
  title: string;
  tag: string;
  limit_date: Number;
};

const Organization = () => {
  const location = useLocation();
  const organization = location.state as Record<string, any>;
  const [options, setOptions] = useState({
    boards: true,
    participants: false,
    details: false,
  });

  const user = JSON.parse(localStorage.getItem("currentUser") ?? "null");
  const [boards, setBoards] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(false);

  const [
    msgWhenAddingOrDeletingParticipant,
    setMsgWhenAddingOrDeletingParticipant,
  ] = useState("");
  const [
    msgWhenDeletingOrLeavingOrganization,
    setMsgWhenDeletingOrLeavingOrganization,
  ] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [createBoard, setCreateBoard] = useState(false);
  const [newParticipant, setNewParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [deletePasswordConfirmation, setDeletePasswordConfirmation] =
    useState(false);
  const [deleteOrganizationConfirmation, setDeleteOrganizationConfirmation] =
    useState(false);

  const navigate = useNavigate();
  const [boardEditingID, setBoardEditingID] = useState();
  const [passwordConfirm, setConfirmPassword] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormCreateBoardData>();
  const [newBoard, setNewBoard] = useState();
  const [name, setName] = useState("");

  const handleBoard = async (board: any) => {
    navigate("/board", { state: board });
  };
  const create = async (data: FormCreateBoardData) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/board/create?organization_id=${organization.id}`,
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
        setTrigger(trigger + 1);

        setName(response.data.board.title);
        setSuccessMsg(true);
      }
    } catch (error: any) {
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
  const deleteBoard = async (board_id: any) => {
    const response = await axios.delete(
      `http://localhost:8000/board/delete?board_id=${board_id}&password=${passwordConfirm}`,
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

  const get_boards = async () => {
    const boards = await axios.get(
      `http://localhost:8000/organization/get_all_boards?organization_id=${organization.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (boards.data) {
      setBoards(boards.data);
    }
  };

  useEffect(() => {
    get_boards();
  }, [trigger]);

  const handleNewParticipant = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/organization/add_new_participant?organization_id=${organization.id}&email=${newParticipantEmail}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.ok) {
        setMsgWhenAddingOrDeletingParticipant(
          "Participant successfully added."
        );

        setTimeout(() => {
          setMsgWhenAddingOrDeletingParticipant("");
        }, 3000);
      }
    } catch (error: any) {
      if (error.response.status == 404) {
        setMsgWhenAddingOrDeletingParticipant("User not found.");
      }
      if (error.response.status == 401) {
        setMsgWhenAddingOrDeletingParticipant(
          "You are already in the group. Nice try!"
        );
      }
      setTimeout(() => {
        setMsgWhenAddingOrDeletingParticipant("");
      }, 3000);
    }
  };
  const handleParticipants = async () => {
    const response = await axios.get(
      `http://localhost:8000/organization/get_all_participants?organization_id=${organization.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data) {
      setParticipants(response.data);
    }
  };

  useEffect(() => {
    if (msgWhenAddingOrDeletingParticipant !== "") {
      handleParticipants();
    }
  }, [msgWhenAddingOrDeletingParticipant]);

  const deleteParticipant = async (participant_email: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/organization/delete_participant?organization_id=${organization.id}&participant_email=${participant_email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == 200) {
        setMsgWhenAddingOrDeletingParticipant(
          "Participant successfully deleted."
        );
      }
    } catch (error: any) {
      if (error.response.status == 404) {
        setMsgWhenAddingOrDeletingParticipant(
          "A error occurred. User not found in the organization. Try again after a few moments."
        );
      }
      if (error.response.status == 401) {
        setMsgWhenAddingOrDeletingParticipant(
          "Permissions denied. Only admins can do that."
        );
      }
    } finally {
      setTimeout(() => {
        setMsgWhenAddingOrDeletingParticipant("");
      }, 3000);
    }
  };

  const deleteOrganization = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/organization/delete?password_confirm=${passwordConfirm}&organization_id=${organization.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == 200) {
        navigate("/home");
      }
    } catch (error: any) {
      setMsgWhenDeletingOrLeavingOrganization(
        "A error occurred. Confirm that the password is correct and try again after a few moments."
      );
    } finally {
      setTimeout(() => {
        setMsgWhenDeletingOrLeavingOrganization("");
      }, 3000);
    }
  };

  const leaveOrganization = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/users/leave_organization?organization_id=${organization.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == 200) {
        navigate("/home");
      }
    } catch (error: any) {
      if (error.response.status == 404) {
        setMsgWhenDeletingOrLeavingOrganization(
          "A error occurred. Try again after a few moments."
        );
      }
      if (error.response.status == 401) {
        setMsgWhenDeletingOrLeavingOrganization(
          "Admins can't leave the organization... Yet."
        );
      }
    } finally {
      setTimeout(() => {
        setMsgWhenDeletingOrLeavingOrganization("");
      }, 3000);
    }
  };
  return (
    <div className="flex-col items-center h-screen bg-white">
      <div className="p-5">
        <h1 className="text-titles p-2">{organization.title}</h1>
        <nav>
          <div className="options-div">
            <button
              onClick={() => {
                setOptions({
                  boards: true,
                  participants: false,
                  details: false,
                });
              }}
              className="text-tables"
            >
              Boards
            </button>
            <p className="divider">|</p>
            <button
              onClick={() => {
                handleParticipants(),
                  setOptions({
                    boards: false,
                    participants: true,
                    details: false,
                  });
              }}
              className="text-tables"
            >
              Participants
            </button>
            <p className="divider">|</p>

            <button
              onClick={() => {
                setOptions({
                  boards: false,
                  participants: false,
                  details: true,
                });
              }}
              className="text-tables"
            >
              Details
            </button>
          </div>
        </nav>
        {createBoard && (
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
                  className="input-sw-mg"
                  placeholder="Enter the name"
                />
                <button
                  onClick={handleSubmit(create)}
                  className="font-bold text-white bg-[#b1132b] pl-4 pr-4 pb-2 pt-2 mb-2 rounded-lg hover:bg-[#d82f49] cursor-pointer"
                >
                  Create Board
                </button>
              </div>
              {successMsg && (
                <p
                  className="text-[#420C14] mb-3 font-medium"
                  onClick={() => handleBoard(newBoard)}
                >
                  Board "{name}" created successfully in organization "
                  {organization.title}", to access already, click here
                </p>
              )}
              {errors.title && <p>{errors.title.message}</p>}
            </form>
          </div>
        )}
        <div>
          {options.boards && (
            <div>
              {organization.creator_id === user.id && (
                <button
                  onClick={() => setCreateBoard(!createBoard)}
                  className="btn-selector"
                >
                  {createBoard ? "Cancel" : "Create new board"}
                </button>
              )}

              {deleteMsg && (
                <p className="hover:underline hover:text-blue-800 cursor-pointer">
                  Board successfully deleted.
                </p>
              )}
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="font-bold flex mt-2 justify-between items-center border-2 p-2"
                >
                  <div className="flex flex-col">
                    <h1 className="task-attr-color">{board.title}</h1>
                    <p className="text-sm text-[#b1132b]">
                      Created at:{" "}
                      {new Date(board.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {deletePasswordConfirmation && boardEditingID === board.id ? (
                    <div className="flex flex-col">
                      <button
                        onClick={() => deleteBoard(board.id)}
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
                        type="password"
                        placeholder="Confirm your password"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <button
                        onClick={async () => {
                          try {
                            const response = await axios.get(
                              `http://localhost:8000/organization/get_all_participants?organization_id=${organization.id}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                  )}`,
                                },
                              }
                            );

                            if (response.data) {
                              setParticipants(response.data);
                              navigate("/board", {
                                state: {
                                  board,
                                  participants: response.data,
                                },
                              });
                            }
                          } catch (error) {
                            console.error(
                              "Erro ao buscar participantes:",
                              error
                            );
                          }
                        }}
                        className="bg-green-700 pl-4 pr-4 mr-4 pt-2 pb-2 text-white mb-2 hover:bg-green-950 cursor-pointer"
                      >
                        Enter the board
                      </button>
                      {user.id === board.creator_id ||
                      user.id === organization.creator_id ? (
                        <button
                          onClick={() => (
                            setDeletePasswordConfirmation(
                              !deletePasswordConfirmation
                            ),
                            setBoardEditingID(board.id)
                          )}
                          className="bg-red-700 pl-4 pr-4 pt-2 pb-2 text-white mb-2 hover:bg-red-950 cursor-pointer"
                        >
                          Delete the board
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {options.participants && (
            <div>
              {organization.creator_id === user.id ? (
                !newParticipant ? (
                  <button
                    onClick={() => setNewParticipant(!newParticipant)}
                    className="btn-selector"
                  >
                    Add a new participant
                  </button>
                ) : (
                  <div>
                    {msgWhenAddingOrDeletingParticipant && (
                      <p>{msgWhenAddingOrDeletingParticipant}</p>
                    )}
                    <input
                      type="text"
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      className="w-[45vw] shadow-lg p-2 mb-4 rounded-lg mr-4"
                      placeholder="Enter the e-mail. If the user exists, it will be added to this board."
                    />
                    <button
                      onClick={() => handleNewParticipant()}
                      className="btn-selector"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setNewParticipant(!newParticipant);
                      }}
                      className="bg-blue-700 font-bold pl-2 pr-2 pt-1 pb-1 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-blue-950 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )
              ) : null}
              {participants.map((participant) => (
                <div className="flex mt-5" key={participant.id}>
                  <img
                    src={participant.profile_picture}
                    alt={participant.username}
                    className="mr-4 w-[50px] h-[50px] rounded-full"
                  />
                  <div className="flex flex-col border-b-1 w-full">
                    <h1>
                      {participant.username}
                      {participant.id === organization.creator_id ? (
                        <strong className="text-sm"> (Admin)</strong>
                      ) : null}
                    </h1>
                    <h1>
                      <strong>Since:</strong>{" "}
                      {new Date(participant.created_at).toLocaleDateString()}
                    </h1>
                    <div className="justify-between">
                      {user.id === organization.creator_id && (
                        <div>
                          {participant.id !== organization.creator_id && (
                            <button
                              onClick={() =>
                                deleteParticipant(participant.email)
                              }
                              className="btn-selector mt-1"
                            >
                              Delete user
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {options.details && (
            <div>
              <h1 className="mt-2">
                Created at:{" "}
                {new Date(organization.created_at).toLocaleDateString()}
              </h1>
              {user.id == organization.creator_id && (
                <div>
                  {!deleteOrganizationConfirmation && (
                    <button
                      onClick={() => setDeleteOrganizationConfirmation(true)}
                      className="btn-selector"
                    >
                      Delete organization
                    </button>
                  )}
                </div>
              )}
              {user.id !== organization.creator_id && (
                <button
                  onClick={() => leaveOrganization()}
                  className="btn-selector ml-2"
                >
                  Leave the group
                </button>
              )}
              {deleteOrganizationConfirmation && (
                <div>
                  <input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-sw-mg"
                    type="password"
                    placeholder="Confirm your password"
                  />
                  <button
                    onClick={() => deleteOrganization()}
                    className="btn-selector ml-2"
                  >
                    Delete (IRREVERSIBLE!)
                  </button>
                  <button
                    onClick={() => setDeleteOrganizationConfirmation(false)}
                    className="btn-selector bg-blue-700 hover:bg-blue-950"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {msgWhenDeletingOrLeavingOrganization && (
                <p>{msgWhenDeletingOrLeavingOrganization}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
