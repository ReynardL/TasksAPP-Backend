import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card, { CardContent } from "./ui/card";
import Button from "./ui/button";
import Badge from "./ui/badge";

const MainPage = ({ fetchTasks, searchTasks }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterBy, setFilterBy] = useState('due');
  const [order, setOrder] = useState('asc');

  const loadTasks = async () => {
    try {
      let taskData;

      const searchParams = sessionStorage.getItem('searchParams')
      ? JSON.parse(sessionStorage.getItem('searchParams'))
      : null;

      if (searchParams) {
        taskData = await searchTasks(searchParams);
      } else {
        taskData = await fetchTasks();
      }

      setTasks(taskData); 
      filterTasks(taskData);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const filterTasks = () => {
    const priorityOrder = {
      low: 0,
      medium: 1,
      high: 2,
    };
  
    const statusOrder = {
      false: 0,
      'in progress': 1,
      true: 2,
    };
    
    const sortedTasks = [...tasks].sort((a, b) => {
      if (filterBy === 'priority') {
        const priorityA = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : -1;
        const priorityB = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : -1;
        return order === 'asc'
          ? priorityA - priorityB
          : priorityB - priorityA;
      } else if (filterBy === 'title') {
        return order === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (filterBy === 'due' || filterBy === 'created') {
        const dateA = a[filterBy] ? new Date(a[filterBy]).getTime() : (order === 'asc' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER);
        const dateB = b[filterBy] ? new Date(b[filterBy]).getTime() : (order === 'asc' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (filterBy === 'completed') {
        const statusA = statusOrder[a.completed] !== undefined ? statusOrder[a.completed] : -1;
        const statusB = statusOrder[b.completed] !== undefined ? statusOrder[b.completed] : -1;
        return order === 'asc'
          ? statusA - statusB
          : statusB - statusA;
      }
      return 0;
    });

    setFilteredTasks(sortedTasks);
  };

  useEffect(() => {
    const storedFilterBy = sessionStorage.getItem('filterBy');
    const storedOrder = sessionStorage.getItem('order');
    
    if (storedFilterBy) {
      setFilterBy(storedFilterBy);
    }
    if (storedOrder) {
      setOrder(storedOrder);
    }

    loadTasks();
  }, [location.state]);

  useEffect(() => {
    filterTasks();
  }, [filterBy, order, tasks]);

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg transform transition-all duration-300 ease-in-out mt-5 mb-5 min-h-[calc(100vh-40px)] flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Tasks</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() =>
              navigate("/search", { state: { currentTasks: tasks } })
            }
            className="border-[#48A6A7] text-[#48A6A7]"
          >
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate("/filter", { state: { filterBy, order } })
            }
            className="border-[#48A6A7] text-[#48A6A7]"
          >
            Filter by
          </Button>
          <Button
            onClick={() => navigate("/create")}
            className="bg-[#48A6A7] text-white"
          >
            Create New
          </Button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="cursor-pointer hover:shadow-lg transition-shadow relative rounded-2xl p-4 shadow-md hover:scale-105 transform transition-all duration-300 ease-in-out"
            >
              <CardContent className="flex flex-col h-full justify-between">
                {/* Priority and Repeat on Top-Right */}
                <div className="flex justify-between items-start w-full">
                  <h2 className="text-lg font-bold text-black">{task.title}</h2>
                  <div className="flex items-center space-x-2 justify-end">
                    {task.repeat_type !== "never" && (
                      <div className="text-xs text-gray-500 flex items-center">
                        🔁 {task.repeat_amount} {task.repeat_type}
                      </div>
                    )}
                    <Badge priority={task.priority}>{task.priority}</Badge>
                  </div>
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Due Date */}
                <div className="text-sm text-gray-500 mt-4">
                  {task.due
                    ? new Date(task.due).toLocaleString()
                    : "No due date"}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No tasks found.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
