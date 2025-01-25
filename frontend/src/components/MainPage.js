import React from "react";
import { useNavigate } from "react-router-dom";

const MainPage = ({ tasks, setSelectedTask }) => {
  const navigate = useNavigate();

  const handleTaskClick = (task) => {
    navigate(`/edit/${task.id}`);
  };

  return (
    <div>
      <h1>Task Management</h1>
      <button onClick={() => navigate("/create")}>Create Task</button>

      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} onClick={() => handleTaskClick(task)}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Due: {task.due}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainPage;
