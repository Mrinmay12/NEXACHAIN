import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <span className="dot" />
        NEXACHAIN
      </div>
      <nav className="nav-group">
        <div className="nav-item active">Dashboard</div>
      </nav>
      <div className="user-chip">
        <strong>{user?.fullName}</strong>
        {user?.email}
        <button className="logout-btn" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
