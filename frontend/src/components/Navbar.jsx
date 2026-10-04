import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const roleNames = { ADMIN: 'Administrator', USER: 'Normal user', OWNER: 'Store owner' };

  return (
    <nav className="topbar" aria-label="Main navigation">
      <Link to="/" className="brand">Store ratings</Link>
      <div className="nav-links">
      {user?.role === 'ADMIN' && <>
        <NavLink to="/admin">Overview</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/stores">Stores</NavLink>
      </>}
      {user?.role === 'USER' && <NavLink to="/stores">Stores</NavLink>}
      {user?.role === 'OWNER' && <NavLink to="/owner">Overview</NavLink>}
      <NavLink to="/password">Change password</NavLink>
      </div>
      <div className="user-identity">
        <strong>{user?.name}</strong>
        <small>{roleNames[user?.role] || user?.role}</small>
      </div>
      <button className="logout-button" type="button" onClick={logout}>Sign out</button>
    </nav>
  );
}