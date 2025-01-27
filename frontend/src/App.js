import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import CreateTaskPage from "./components/CreateTaskPage";
import EditTaskPage from "./components/EditTaskPage";
import SearchPage from "./components/SearchPage";
import FilterPage from "./components/FilterPage";
import DisplayTaskPage from "./components/DisplayTaskPage";

const apiUrl = process.env.REACT_APP_API_URL;

const App = () => {

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${apiUrl}/tasks`); 
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in fetchTasks:", error);
      throw error;
    }
  };

  const searchTasks = async (searchParams) => {

    const finalParams = {
      title: searchParams.title === "" ? null : searchParams.title,
      description: searchParams.description === "" ? null : searchParams.description,
      completed: searchParams.completed === "" ? null : searchParams.completed,
      priority: searchParams.priority === "" ? null : searchParams.priority,
      repeat_type: searchParams.repeat_type === "" ? null : searchParams.repeat_type,
      due: searchParams.due === "" ? null : searchParams.due,
      created: searchParams.created === "" ? null : searchParams.created,
    };

    try {
      const response = await fetch(`${apiUrl}/tasks/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(finalParams),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in searchTasks:", error);
      throw error;
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainPage fetchTasks={fetchTasks} searchTasks={searchTasks} />}
        />
        <Route
          path="/create"
          element={<CreateTaskPage apiUrl={apiUrl} />}
        />
        <Route
          path="/tasks/:id"
          element={<DisplayTaskPage apiUrl={apiUrl} />}
        />
        <Route
          path="/edit/:id"
          element={<EditTaskPage apiUrl={apiUrl} />}
        />
        <Route
          path="/search"
          element={<SearchPage />}
        />
        <Route
          path="/filter"
          element={<FilterPage />}
        />
      </Routes>
    </Router>
  );
};

export default App;

