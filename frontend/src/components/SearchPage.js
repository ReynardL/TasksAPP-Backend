import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useState(
    sessionStorage.getItem('searchParams')
      ? JSON.parse(sessionStorage.getItem('searchParams'))
      : {
          title: '',
          description: '',
          completed: '',
          due: '',
          created: '',
          priority: '',
          repeat_type: '',
        }
  );
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedSearchParams = { ...searchParams, [name]: value };
    setSearchParams(updatedSearchParams);
  };

  const applySearch = (e) => {
    e.preventDefault();
    sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
    navigate("/", { state: { searchParams } });
  };

  const clearSearch = () => {
    setSearchParams({
      title: '',
      description: '',
      completed: '',
      due: '',
      created: '',
      priority: '',
      repeat_type: '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Search Task</h1>
        <form onSubmit={applySearch}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title:</label>
              <input
                type="text"
                name="title"
                value={searchParams.title}
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
                value={searchParams.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Completed:</label>
              <select
                name="completed"
                value={searchParams.completed}
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
                name="due"
                value={searchParams.due}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority:</label>
              <select
                name="priority"
                value={searchParams.priority}
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
              <label className="block text-sm font-medium text-gray-700">Repeat Type:</label>
              <select
                name="repeat_type"
                value={searchParams.repeat_type}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created:</label>
              <input
                type="date"
                name="created"
                value={searchParams.created}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-1/3 py-3 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="w-1/3 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
              >
                Clear
              </button>
              <button
                type="submit"
                className="w-1/3 py-3 bg-[#48A6A7] text-white font-semibold rounded-lg shadow-md hover:bg-[#3e8e8f]"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchPage;
