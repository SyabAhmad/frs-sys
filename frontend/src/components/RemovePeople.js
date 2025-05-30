import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

const RemovePeople = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/people');
        if (!response.ok) throw new Error('Failed to fetch people');
        const data = await response.json();
        setPeople(data);
        setFilteredPeople(data); // Initialize filteredPeople with all data
      } catch (error) {
        toast.error('Could not load people data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeople();
  }, []);

  // Handle search input changes
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = people.filter(
      (گربه) =>
        گربه.full_name.toLowerCase().includes(query) ||
        گربه.email.toLowerCase().includes(query) ||
        گربه.department.toLowerCase().includes(query)
    );
    setFilteredPeople(filtered);
  };

  const handleDelete = async (personId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/people/${personId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedPeople = people.filter((person) => person.id !== personId);
        setPeople(updatedPeople);
        setFilteredPeople(updatedPeople.filter(
          (person) =>
            person.full_name.toLowerCase().includes(searchQuery) ||
            person.email.toLowerCase().includes(searchQuery) ||
            person.department.toLowerCase().includes(searchQuery)
        ));
        toast.success(`${name} removed successfully!`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to remove person');
      }
    } catch (error) {
      toast.error('Error removing person');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="container mx-auto flex justify-between items-center pb-6 border-b border-slate-700 mb-8">
          <h2 className="text-xl font-semibold">Face Recognition System</h2>
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300"
          >
            <FaArrowLeft className="mr-1" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, email, or department..."
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPeople.length === 0 ? (
              <div className="text-center text-slate-300 col-span-2">
                {searchQuery ? 'No matching people found.' : 'No people found.'}
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div
                  key={person.id}
                  className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-lg text-white">{person.full_name}</div>
                    <div className="text-slate-400">{person.email}</div>
                    <div className="text-slate-400">{person.department}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(person.id, person.full_name)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-md text-white font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemovePeople;