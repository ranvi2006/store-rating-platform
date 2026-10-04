import { useEffect, useState } from 'react';
import api from '../api';
import SortableTable from '../components/SortableTable';
import Navbar from '../components/Navbar';

export default function AdminStores() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', dir: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    api.get('/admin/stores', { params: { ...filters, ...sort } })
      .then(({ data }) => {
        if (current) {
          setRows(data);
          setError('');
          setLoading(false);
        }
      })
      .catch(() => {
        if (current) {
          setError('Stores could not be loaded. Please try again.');
          setLoading(false);
        }
      });
    return () => { current = false; };
  }, [filters, sort]);

  const onSort = key => {
    setLoading(true);
    setSort(s => ({ sortBy: key, dir: s.sortBy === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const updateFilter = (key, value) => {
    setLoading(true);
    setFilters(current => ({ ...current, [key]: value }));
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: r => r.rating ?? '-' },
  ];

  return (
    <>
      <Navbar />
      <main className="page-content">
        <header className="page-heading">
          <h1>Stores</h1>
          <p>Browse registered stores and their average ratings.</p>
        </header>
        <div className="filters" role="group" aria-label="Filter stores">
          {['name', 'email', 'address'].map(key => (
            <input key={key} aria-label={`Filter by ${key}`} placeholder={`Filter ${key}`}
                   value={filters[key]}
                   onChange={event => updateFilter(key, event.target.value)} />
          ))}
        </div>
        {error && <p className="message error" role="alert">{error}</p>}
        <SortableTable columns={columns} rows={rows} {...sort} onSort={onSort} loading={loading} />
      </main>
    </>
  );
}