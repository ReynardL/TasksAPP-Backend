import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FilterPage = () => {
  const [filterBy, setFilterBy] = useState(() => sessionStorage.getItem('filterBy') || 'due'); 
  const [order, setOrder] = useState(() => sessionStorage.getItem('order') || 'asc'); 
  const navigate = useNavigate();

  const toggleOrder = (newFilter) => {
    if (filterBy === newFilter) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setFilterBy(newFilter);
      setOrder('asc'); 
    }
  };

  const applyFilter = (e) => {
    e.preventDefault();

    sessionStorage.setItem('filterBy', filterBy);
    sessionStorage.setItem('order', order);

    navigate('/', {
      state: {
        filterBy: filterBy,
        order: order,
      },
    });
  };

  const getButtonStyle = (filter) => {
    if (filter === filterBy) return 'bg-[#9ACBD0]';
    return 'bg-gray-300';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Select Filters</h1>
        <div className="space-y-4">
          <div className="flex justify-between">
            <button 
              onClick={() => toggleOrder('due')}
              className={`px-6 py-3 w-full text-left rounded-lg hover:scale-105 transition-all ${getButtonStyle('due')} flex justify-between items-center`}
            >
              Due Date
              {filterBy === 'due' && (
                <span className="ml-2">{order === 'asc' ? '⬆️' : '⬇️'}</span>
              )}
            </button>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => toggleOrder('created')}
              className={`px-6 py-3 w-full text-left rounded-lg hover:scale-105 transition-all ${getButtonStyle('created')} flex justify-between items-center`}
            >
              Created Date
              {filterBy === 'created' && (
                <span className="ml-2">{order === 'asc' ? '⬆️' : '⬇️'}</span>
              )}
            </button>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => toggleOrder('title')}
              className={`px-6 py-3 w-full text-left rounded-lg hover:scale-105 transition-all ${getButtonStyle('title')} flex justify-between items-center`}
            >
              Title
              {filterBy === 'title' && (
                <span className="ml-2">{order === 'asc' ? '⬆️' : '⬇️'}</span>
              )}
            </button>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => toggleOrder('priority')}
              className={`px-6 py-3 w-full text-left rounded-lg hover:scale-105 transition-all ${getButtonStyle('priority')} flex justify-between items-center`}
            >
              Priority
              {filterBy === 'priority' && (
                <span className="ml-2">{order === 'asc' ? '⬆️' : '⬇️'}</span>
              )}
            </button>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => toggleOrder('completed')}
              className={`px-6 py-3 w-full text-left rounded-lg hover:scale-105 transition-all ${getButtonStyle('completed')} flex justify-between items-center`}
            >
              Completed
              {filterBy === 'completed' && (
                <span className="ml-2">{order === 'asc' ? '⬆️' : '⬇️'}</span>
              )}
            </button>
          </div>
        </div>
        <div className="flex justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-1/2 py-3 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500"
          >
            Back
          </button>
          <button
            onClick={applyFilter}
            className="w-1/2 py-3 bg-[#48A6A7] text-white font-semibold rounded-lg shadow-md hover:bg-[#3e8e8f]"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPage;
