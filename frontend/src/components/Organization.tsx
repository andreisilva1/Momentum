import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Organization = () => {
  const location = useLocation();
  const organization = location.state as Record<string, any>;
  const [options, setOptions] = useState({
    boards: false,
    participants: false,
    details: false,
  });

  const user = JSON.parse(localStorage.getItem("currentUser") ?? "null");
  const [boards, setBoards] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [msgWhenAddingNewParticipant, setMsgWhenAddingNewParticipant] =
    useState<boolean | string>("");

  const [newParticipant, setNewParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [deletePasswordConfirmation, setDeletePasswordConfirmation] =
    useState(false);
  const navigate = useNavigate();
  const [boardEditingID, setBoardEditingID] = useState();
  const [passwordConfirm, setConfirmPassword] = useState("");

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
      setSuccessMsg(true);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
  const handleBoards = async () => {
    const response = await axios.get(
      `http://localhost:8000/organization/get_all_boards?organization_id=${organization.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.data) {
      setBoards(response.data);
      console.log(boards);
      console.log(options.boards);
    }
  };

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
        setMsgWhenAddingNewParticipant("Participant successfully added.");

        setTimeout(() => {
          setMsgWhenAddingNewParticipant("");
        }, 3000);
      }
    } catch (error: any) {
      if (error.response.status == 404) {
        setMsgWhenAddingNewParticipant("User not found.");
      }
      if (error.response.status == 401) {
        setMsgWhenAddingNewParticipant(
          "You are already in the group. Nice try!"
        );
      }
      setTimeout(() => {
        setMsgWhenAddingNewParticipant("");
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

  return (
    <div className="flex-col items-center h-screen">
      <div className="border-2 p-5 m-2">
        <h1 className="w-full font-bold text-2xl mb-5">{organization.title}</h1>
        <nav>
          <div className="flex v-screen justify-between p-1 border-2">
            <button
              onClick={() => {
                handleBoards(),
                  setOptions({
                    boards: true,
                    participants: false,
                    details: false,
                  });
              }}
              className="font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Boards
            </button>
            <p>|</p>
            <button
              onClick={() => {
                handleParticipants(),
                  setOptions({
                    boards: false,
                    participants: true,
                    details: false,
                  });
              }}
              className="font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Participants
            </button>
            <p>|</p>

            <button
              onClick={() => {
                setOptions({
                  boards: false,
                  participants: false,
                  details: true,
                });
              }}
              className="font-storyscript font-bold hover:opacity-85 cursor-pointer"
            >
              Details
            </button>
          </div>
        </nav>
        <div>
          {options.boards && (
            <div>
              {organization.creator_id === user.id && (
                <button
                  onClick={() =>
                    navigate("/board/create", {
                      state: {
                        organization_id: organization.id,
                        organization_name: organization.title,
                      },
                    })
                  }
                  className="bg-green-700 font-bold pl-2 pr-2 pt-1 pb-1 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-green-950 cursor-pointer"
                >
                  Create new board
                </button>
              )}

              {successMsg && (
                <p className="hover:underline hover:text-blue-800 cursor-pointer">
                  Board successfully deleted.
                </p>
              )}
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="font-bold flex mt-2 justify-between items-center border-2 p-2"
                >
                  {board.title}
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
                        type="text"
                        placeholder="Confirm your password"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <button
                        onClick={() => navigate("/board", { state: board })}
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
                newParticipant ? (
                  <button
                    onClick={() => setNewParticipant(!newParticipant)}
                    className="bg-green-700 font-bold pl-2 pr-2 pt-1 pb-1 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-green-950 cursor-pointer"
                  >
                    Add a new participant
                  </button>
                ) : (
                  <div>
                    <p>{msgWhenAddingNewParticipant}</p>
                    <input
                      type="text"
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      className="w-[45vw] shadow-lg p-2 mb-4 rounded-lg mr-4"
                      placeholder="Enter the e-mail. If the user exists, it will be added to this board."
                    />
                    <button
                      onClick={() => handleNewParticipant()}
                      className="bg-green-700 font-bold pl-2 pr-2 mr-2 pt-1 pb-1 text-sm rounded-lg mt-4 text-white mb-2 hover:bg-green-950 cursor-pointer"
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
                  <div className="flex flex-col">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {options.details && (
            <h1>
              Created at:{" "}
              {new Date(organization.created_at).toLocaleDateString()}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
