import { useEffect, useState } from 'react';
import api from '../api';
import SortableTable from '../components/SortableTable';
import Navbar from '../components/Navbar';

export default function UserStores() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', dir: 'asc' });
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;

    api.get('/stores', {
      params: { search, sortBy: sort.sortBy, dir: sort.dir },
    })
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
  }, [search, sort.sortBy, sort.dir, revision]);

  const rate = async (storeId, rating) => {
    try {
      await api.post('/stores/rate', { storeId, rating: Number(rating) });
      setLoading(true);
      setRevision(value => value + 1);
      setError('');
    } catch {
      setError('Your rating could not be saved. Please try again.');
    }
  };

  const onSort = key => {
    setLoading(true);
    setSort(s => ({ sortBy: key, dir: s.sortBy === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const changeSearch = value => {
    setLoading(true);
    setSearch(value);
  };

  const columns = [
    { key: 'name', label: 'Store', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'overallRating', label: 'Overall Rating', sortable: true, render: r => r.overallRating ?? '-' },
    { key: 'myRating', label: 'My Rating', render: r => r.myRating ?? 'Not rated' },
    { key: 'action', label: 'Rate / Modify', render: r => (
      <select aria-label={`Your rating for ${r.name}`} value={r.myRating ?? ''}
              onChange={e => rate(r.id, e.target.value)}>
        <option value="" disabled>Select</option>
        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    ) },
  ];

  return (
    <>
      <Navbar />
      <main className="page-content">
        <header className="page-heading">
          <h1>Find a store</h1>
          <p>Compare ratings and submit or update your score from 1 to 5.</p>
        </header>
        <div className="filters">
          <input aria-label="Search stores" placeholder="Search name or address"
                 value={search} onChange={event => changeSearch(event.target.value)} />
        </div>
        {error && <p className="message error" role="alert">{error}</p>}
        <SortableTable columns={columns} rows={rows} {...sort} onSort={onSort} loading={loading}
                       emptyMessage="No stores match this search." />
      </main>
    </>
  );
}