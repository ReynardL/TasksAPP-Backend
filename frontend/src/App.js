import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import CreateTaskPage from "./components/CreateTaskPage";
import EditTaskPage from "./components/EditTaskPage";

const apiUrl = process.env.REACT_APP_API_URL;

const App = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    fetch(`${apiUrl}/tasks`)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainPage tasks={tasks} />}
        />
        <Route
          path="/create"
          element={<CreateTaskPage fetchTasks={fetchTasks} />}
        />
        <Route
          path="/edit/:id"
          element={<EditTaskPage fetchTasks={fetchTasks} />}
        />
      </Routes>
    </Router>
  );
};

export default App;

