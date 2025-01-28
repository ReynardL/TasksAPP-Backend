import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

function EditTaskPage({ apiUrl }) {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation(); 
  const initialTaskData = location.state ? location.state.taskData : {}; 
  const [taskData, setTaskData] = useState(initialTaskData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();

    const combinedDue =
      taskData.dueDate && taskData.dueTime
        ? `${taskData.dueDate}T${taskData.dueTime}`
        : null;

    const updatedTask = {
      title: taskData.title === "" ? null : taskData.title,
      description: taskData.description === "" ? null : taskData.description,
      completed: taskData.completed,
      priority: taskData.priority === "None" ? null : taskData.priority,
      repeat_type: taskData.repeat_type,
      repeat_amount: taskData.repeat_amount === "" ? null : taskData.repeat_amount,
      due: combinedDue,
    };

    fetch(`${apiUrl}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => response.json())
      .then(() => {
        navigate('/');
      })
      .catch((error) => console.error('Error updating task:', error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Edit Task</h1>
        <form onSubmit={handleUpdateTask}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title:</label>
              <input
                type="text"
                name="title"
                value={taskData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description:</label>
              <input
                type="text"
                name="description"
                value={taskData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Completed:</label>
              <select
                name="completed"
                value={taskData.completed}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">False</option>
                <option value="in progress">In Progress</option>
                <option value="true">True</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Time:</label>
              <input
                type="time"
                name="dueTime"
                value={taskData.dueTime}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority:</label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Repeat Every:</label>
              <select
                name="repeatType"
                value={taskData.repeatType}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Repeat Amount:</label>
              <input
                type="number"
                name="repeatAmount"
                value={taskData.repeatAmount}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repeat Count"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-1/2 py-3 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-[#48A6A7] text-white font-semibold rounded-lg shadow-md hover:bg-[#3e8e8f]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskPage;
