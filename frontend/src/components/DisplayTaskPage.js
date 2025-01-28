import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "./ui/badge";

function DisplayTaskPage({ apiUrl }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [taskData, setTaskData] = useState({
    id : "",    
    title: "",
    description: "",
    completed: "false",
    dueDate: "",
    dueTime: "",
    priority: "None",
    repeat_type: "never",
    repeat_amount: "",
    createdDate: "",
    createdTime: "",
  });

  useEffect(() => {
    fetch(`${apiUrl}/tasks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        const dueDateTime = data.due ? data.due.split("T") : ["", ""];
        const createdDateTime = data.created ? data.created.split("T") : ["", ""];
        setTaskData({
          id: data.id,
          title: data.title || "",
          description: data.description || "",
          completed: data.completed || "false",
          dueDate: dueDateTime[0] || "",
          dueTime: dueDateTime[1] || "",
          priority: data.priority || "None",
          repeat_type: data.repeat_type || "never",
          repeat_amount: data.repeat_amount || "",
          createdDate: createdDateTime[0] || "",
          createdTime: createdDateTime[1]?.slice(0, 8) || "",
        });
      })
      .catch((error) => console.error("Error fetching task data:", error));
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-lg min-h-[500px] flex flex-col">
        {/* Title and Priority Section */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{taskData.title}</h1>
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            <Badge priority={taskData.priority}>
              {taskData.priority === "None" ? "No Priority" : taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
            </Badge>
            {/* ID Badge */}
            <Badge className="bg-gray-400 text-white">{`#${taskData.id}`}</Badge>
          </div>
        </div>

        {/* Description Section */}
        <p className="text-gray-700 mb-4">{taskData.description || "No description available."}</p>

        {/* Main Details Section */}
        <div className="text-sm text-gray-600 space-y-2 mt-auto">
          <p>
            <strong>Repeat:</strong>{" "}
            {taskData.repeat_type !== "never"
              ? `Every ${taskData.repeat_amount} ${taskData.repeat_type}`
              : "never"}
          </p>
          <p>
            <strong>Due:</strong> {taskData.dueDate} {taskData.dueTime}
          </p>
          <p>
            <strong>Created:</strong> {taskData.createdDate} {taskData.createdTime}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this task?")) {
                fetch(`${apiUrl}/tasks/${id}`, { method: "DELETE" })
                  .then(() => navigate("/"))
                  .catch((error) => console.error("Error deleting task:", error));
              }
            }}
            className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => navigate(`/edit/${id}`, { state: { taskData } })}
            className="flex-1 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisplayTaskPage;
