import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { auth, database } from './firebaseConfig';
import { ref, get, update, remove } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { deleteUser } from 'firebase/auth';
import './DataVisualization.css';

const DEPARTMENT_OPTIONS = ['-', 'CSE', 'ECE', 'EEE', 'IT', 'CSD', 'CAI', 'MECH', 'CIVIL', 'CAI&ML', 'CML', 'Other'];
const YEAR_OPTIONS = ['-', '1st Year', '2nd Year', '3rd Year', '4th Year'];

const TabSwitcher = () => {
  const [activeTab, setActiveTab] = useState('table');
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserCollege, setCurrentUserCollege] = useState(null);
  const [chartType, setChartType] = useState('department');
  const [pieData, setPieData] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async (user) => {
      try {
        const collegeRef = ref(database, `Users/College/${user.uid}/collegeName`);
        const collegeSnapshot = await get(collegeRef);
        const collegeName = collegeSnapshot.val();
        setCurrentUserCollege(collegeName);

        if (!collegeName) {
          throw new Error('College name not found for current user');
        }

        const studentsRef = ref(database, 'Users/Students');
        const studentsSnapshot = await get(studentsRef);

        if (!studentsSnapshot.exists()) {
          throw new Error('No student data found');
        }

        const studentsData = [];
        studentsSnapshot.forEach((childSnapshot) => {
          const student = childSnapshot.val();
          if (student.collegeName === collegeName) {
            studentsData.push({
              id: childSnapshot.key,
              fullname: student.fullname || 'N/A',
              email: student.email || 'N/A',
              location: student.location || 'N/A',
              phoneNumber: student.phoneNumber || 'N/A',
              department: student.department || 'N/A',
              year: student.year || 'N/A',
            });
          }
        });

        setUserData(studentsData);
        updatePieData(studentsData, chartType);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setError('No authenticated user');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    updatePieData(userData, chartType);
  }, [chartType, userData]);

  const updatePieData = (data, type) => {
    const groupedData = data.reduce((acc, user) => {
      const key = user[type];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.entries(groupedData).map(([key, value]) => ({
      name: key,
      value,
    }));

    setPieData(formattedData);
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  // Edit Handlers
  const handleEditClick = (user) => {
    setEditingUser({ ...user });
  };

  const handleEditChange = (e, field) => {
    setEditingUser(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      // Determine the final department value
      const finalDepartment = editingUser.department === 'Other'
        ? `Others: ${editingUser.customDepartment || 'Unspecified'}`
        : editingUser.department;

      // Update in Firebase
      const userRef = ref(database, `Users/Students/${editingUser.id}`);
      await update(userRef, {
        fullname: editingUser.fullname,
        email: editingUser.email,
        location: editingUser.location,
        phoneNumber: editingUser.phoneNumber,
        department: finalDepartment, // Use the modified department
        year: editingUser.year,
      });

      // Update local state
      setUserData(prev => prev.map(user =>
        user.id === editingUser.id
          ? { ...editingUser, department: finalDepartment }
          : user
      ));

      // Reset editing state
      setEditingUser(null);
    } catch (err) {
      console.error('Error saving edit:', err);
      alert('Failed to save changes');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Get the current authenticated user
      const user = auth.currentUser;
  
      // Remove from Firebase Realtime Database
      const userRef = ref(database, `Users/Students/${userId}`);
      await remove(userRef);
  
      // Delete the authentication account
      if (user && user.uid === userId) {
        await deleteUser(user);
      } else {
        // If the current user is not the one being deleted, 
        // you might need additional authentication or reauthentication
        console.warn('Cannot delete authentication account for a different user');
      }
  
      // Update local state
      setUserData(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };
  const renderDepartmentSelect = () => {
    const departments = [...DEPARTMENT_OPTIONS];

    return (
      <div className="department-select-container">
        <select
          value={editingUser.department}
          onChange={(e) => {
            handleEditChange(e, 'department');
            // Reset custom department if not 'Other'
            if (e.target.value !== 'Other') {
              setEditingUser(prev => ({
                ...prev,
                customDepartment: ''
              }));
            }
          }}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {editingUser.department === 'Other' && (
          <input
            type="text"
            placeholder="Specify Department"
            value={editingUser.customDepartment || ''}
            onChange={(e) => setEditingUser(prev => ({
              ...prev,
              customDepartment: e.target.value
            }))}
            required
          />
        )}
      </div>
    );
  };

  const renderYearSelect = () => {
    return (
      <select
        value={editingUser.year}
        onChange={(e) => handleEditChange(e, 'year')}
      >
        {YEAR_OPTIONS.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };

  const TableIcon = () => (
    <span className="Data-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    </span>
  );

  const ChartIcon = () => (
    <span className="Data-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    </span>
  );

  if (loading) {
    return <div className="Data-container">Loading...</div>;
  }

  if (error) {
    return <div className="Data-container">Error: {error}</div>;
  }

  return (
    <div className="Data-container">
      <div className="Data-tabHeader">
        <div className="Data-tabList">
          <button
            onClick={() => setActiveTab('table')}
            className={`Data-tabButton ${activeTab === 'table' ? 'Data-tabButtonActive' : ''}`}
          >
            <TableIcon />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={`Data-tabButton ${activeTab === 'pie' ? 'Data-tabButtonActive' : ''}`}
          >
            <ChartIcon />
            <span>Pie View</span>
          </button>
        </div>
      </div>

      <div className="Data-tabContent">
        {activeTab === 'table' ? (
          <div className="Data-tableView">
            <div className="Data-tableWrapper">
              <table className="Data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Full Name</th>
                    <th style={{ textAlign: 'center' }}>Email</th>
                    <th style={{ textAlign: 'center' }}>Location</th>
                    <th style={{ textAlign: 'center' }}>Phone Number</th>
                    <th style={{ textAlign: 'center' }}>Department</th>
                    <th style={{ textAlign: 'center' }}>Year</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((user) => (
                    <tr key={user.id}>
                      {editingUser && editingUser.id === user.id ? (
                        <>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="text"
                              value={editingUser.fullname}
                              onChange={(e) => handleEditChange(e, 'fullname')}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => handleEditChange(e, 'email')}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="text"
                              value={editingUser.location}
                              onChange={(e) => handleEditChange(e, 'location')}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="tel"
                              value={editingUser.phoneNumber}
                              onChange={(e) => handleEditChange(e, 'phoneNumber')}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {renderDepartmentSelect()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {renderYearSelect()}
                          </td>
                          <td style={{ textAlign: 'center' }} data-action-buttons>
                            <button onClick={handleSaveEdit}>Save</button>
                            <button onClick={() => setEditingUser(null)}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ textAlign: 'center' }}>{user.fullname}</td>
                          <td style={{ textAlign: 'center' }}>{user.email}</td>
                          <td style={{ textAlign: 'center' }}>{user.location}</td>
                          <td style={{ textAlign: 'center' }}>{user.phoneNumber}</td>
                          <td style={{ textAlign: 'center' }}>{user.department}</td>
                          <td style={{ textAlign: 'center' }}>{user.year}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => handleEditClick(user)}>Edit</button>
                            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="Data-pieView">
            <div className="Data-dropdown">
              <label htmlFor="chartType">Type: </label>
              <select id="chartType" value={chartType} onChange={handleChartTypeChange}>
                <option value="department">Department</option>
                <option value="year">Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabSwitcher;