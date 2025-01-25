import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

function EditTaskPage({ fetchTasks }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Get task ID from the route
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    completed: 'false',
    dueDate: '',
    dueTime: '',
    priority: 'None',
    repeatType: 'never',
    repeatAmount: '',
  });

  // Fetch the task data when the component loads
  useEffect(() => {
    fetch(`${apiUrl}/tasks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        const dueDateTime = data.due ? data.due.split('T') : ['', ''];
        setTaskData({
          title: data.title || '',
          description: data.description || '',
          completed: data.completed || 'false',
          dueDate: dueDateTime[0] || '',
          dueTime: dueDateTime[1] || '',
          priority: data.priority || 'None',
          repeatType: data.repeat_type || 'never',
          repeatAmount: data.repeat_amount || '',
        });
      })
      .catch((error) => console.error('Error fetching task data:', error));
  }, [id]);

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
      repeat_type: taskData.repeatType,
      repeat_amount: taskData.repeatAmount === "" ? null : taskData.repeatAmount,
      due: combinedDue,
    };

    console.log(updatedTask);

    fetch(`${apiUrl}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => response.json())
      .then(() => {
        fetchTasks(); // Refresh task list
        navigate('/'); // Navigate back to the main page
      })
      .catch((error) => console.error('Error updating task:', error));
  };

  return (
    <div>
      <h1>Edit Task</h1>
      <form onSubmit={handleUpdateTask}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={taskData.title}
            onChange={handleInputChange}
            placeholder="Title"
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={taskData.description}
            onChange={handleInputChange}
            placeholder="Description"
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
          <label>Repeat By:</label>
          <input
            type="number"
            name="repeatAmount"
            value={taskData.repeatAmount}
            onChange={handleInputChange}
            min="1"
            max="1000"
            step="1"
          />
        </div>
        <div>
          <button type="submit">Save Changes</button>
        </div>
      </form>
      <button onClick={() => navigate('/')}>Back</button>
    </div>
  );
}

export default EditTaskPage;
