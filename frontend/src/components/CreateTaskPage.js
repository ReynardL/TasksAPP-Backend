import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

function CreateTaskPage({ fetchTasks }) {
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    completed: "false",
    dueDate: "",
    dueTime: "",
    priority: "None",
    repeatType: "never",
    repeatAmount: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();

    let combinedDue = taskData.dueDate && taskData.dueTime 
      ? `${taskData.dueDate}T${taskData.dueTime}` 
      : null;

    const newTask = {
      title: taskData.title === "" ? null : taskData.title,
      description: taskData.description === "" ? null : taskData.description,
      completed: taskData.completed,
      priority: taskData.priority === "None" ? null : taskData.priority,
      repeat_type: taskData.repeatType,
      repeat_amount: taskData.repeatAmount === "" ? null : taskData.repeatAmount,
      due: combinedDue,
    };

    console.log(JSON.stringify(newTask));

    fetch(`${apiUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => response.json())
      .then(() => {
        fetchTasks();
        navigate("/");
      })
      .catch((error) => console.error("Error creating task:", error));
  };

  return (
    <div>
      <h1>Create a New Task</h1>
      <form onSubmit={handleCreateTask}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={taskData.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={taskData.description}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Completed:</label>
          <select
            name="completed"
            value={taskData.completed}
            onChange={handleInputChange}
          >
            <option value="false">False</option>
            <option value="in progress">In Progress</option>
            <option value="true">True</option>
          </select>
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={taskData.dueDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Due Time:</label>
          <input
            type="time"
            name="dueTime"
            value={taskData.dueTime}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Priority:</label>
          <select
            name="priority"
            value={taskData.priority}
            onChange={handleInputChange}
          >
            <option value="None">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label>Repeat Every:</label>
          <select
            name="repeatType"
            value={taskData.repeatType}
            onChange={handleInputChange}
          >
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label>Repeat Amount:</label>
          <input
            type="number"
            name="repeatAmount"
            value={taskData.repeatAmount}
            onChange={handleInputChange}
            min="1"
            max="1000"
          />
        </div>
        <button type="submit">Create Task</button>
      </form>
      <button onClick={() => navigate("/")}>Back</button>
    </div>
  );
};

export default CreateTaskPage;
