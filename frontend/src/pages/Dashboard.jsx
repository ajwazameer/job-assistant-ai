import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in ✅</p>
      {user && (
        <div>
          <p>Welcome, {user.name} ({user.email})</p>
        </div>
      )}
      <button type="button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;
