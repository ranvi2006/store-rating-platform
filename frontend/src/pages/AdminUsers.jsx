import { useEffect, useState } from 'react';
import api from '../api';
import SortableTable from '../components/SortableTable';
import Navbar from '../components/Navbar';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', dir: 'asc' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let current = true;

    api.get('/admin/users', { params: { ...filters, ...sort } })
      .then(({ data }) => {
        if (current) {
          setRows(data);
          setError('');
        }
      })
      .catch(() => {
        if (current) setError('Users could not be loaded. Please try again.');
      });

    return () => { current = false; };
  }, [filters, sort]);

  const onSort = key =>
    setSort(s => ({ sortBy: key, dir: s.sortBy === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const viewUser = async id => {
    setSelectedUser(null);
    setDetailError('');
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setSelectedUser(data);
    } catch {
      setDetailError('User details could not be loaded. Please try again.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'details', label: 'Details', render: row => (
      <button type="button" onClick={() => viewUser(row.id)}>View</button>
    ) },
  ];

  return (
    <>
      <Navbar />
      <main className="page-content">
        <header className="page-heading">
          <h1>Users</h1>
          <p>Manage accounts and review their details.</p>
        </header>
        <div className="filters">
          {['name', 'email', 'address'].map(key => (
            <input key={key} aria-label={`Filter by ${key}`} placeholder={`Filter ${key}`}
                   value={filters[key]}
                   onChange={e => setFilters(current => ({ ...current, [key]: e.target.value }))} />
          ))}
          <select aria-label="Filter by role" value={filters.role}
                  onChange={e => setFilters(current => ({ ...current, role: e.target.value }))}>
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Normal User</option>
            <option value="OWNER">Store Owner</option>
          </select>
        </div>
        {error && <p className="message error" role="alert">{error}</p>}
        <SortableTable columns={columns} rows={rows} {...sort} onSort={onSort} />
        {detailError && <p className="message error" role="alert">{detailError}</p>}
        {selectedUser && (
          <section className="detail-panel" aria-live="polite">
            <h2>{selectedUser.name}</h2>
            <dl>
              <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
              <div><dt>Address</dt><dd>{selectedUser.address || 'Not provided'}</dd></div>
              <div><dt>Role</dt><dd>{selectedUser.role}</dd></div>
              {selectedUser.role === 'OWNER' && (
                <div><dt>Store rating</dt><dd>{selectedUser.rating ?? 'No ratings yet'}</dd></div>
              )}
            </dl>
          </section>
        )}
      </main>
    </>
  );
}