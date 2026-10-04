import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { validateStore, validateUser, errMsg } from '../validators';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [owners, setOwners] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [refresh, setRefresh] = useState(0);

  const [u, setU] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [uErr, setUErr] = useState({});
  const [s, setS] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [sErr, setSErr] = useState({});

  useEffect(() => {
    let current = true;
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users', { params: { role: 'OWNER' } }),
    ]).then(([dashboard, ownerList]) => {
      if (current) {
        setStats(dashboard.data);
        setOwners(ownerList.data);
      }
    }).catch(() => {
      if (current) {
        setMsg('Dashboard data could not be loaded. Please try again.');
        setMsgType('error');
      }
    });
    return () => { current = false; };
  }, [refresh]);

  const addUser = async e => {
    e.preventDefault();
    const errs = validateUser(u);
    setUErr(errs);
    if (Object.keys(errs).length) return;
    try {
      const { data } = await api.post('/admin/users', u);
      setMsg(data.message);
      setMsgType('success');
      setU({ name: '', email: '', address: '', password: '', role: 'USER' });
      setRefresh(value => value + 1);
    } catch (err) {
      setMsg(errMsg(err));
      setMsgType('error');
    }
  };

  const addStore = async e => {
    e.preventDefault();
    const errs = validateStore(s);
    if (!s.ownerId) errs.ownerId = 'Select an owner';
    setSErr(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/stores', { ...s, ownerId: Number(s.ownerId) });
      setMsg('Store created');
      setMsgType('success');
      setS({ name: '', email: '', address: '', ownerId: '' });
      setRefresh(value => value + 1);
    } catch (err) {
      setMsg(errMsg(err));
      setMsgType('error');
    }
  };

  const field = (values, setValues, errors, key, group) => (
    <div className={`field ${key === 'address' ? 'field-wide' : ''}`} key={key}>
      <label htmlFor={`${group}-${key}`}>{key[0].toUpperCase() + key.slice(1)}</label>
            <input id={`${group}-${key}`} type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'}
              value={values[key]}
              minLength={key === 'name' ? 20 : key === 'password' ? 8 : undefined}
              maxLength={key === 'address' ? 400 : key === 'name' ? 60 : key === 'password' ? 16 : undefined}
             autoComplete={key === 'password' ? 'new-password' : undefined}
             required={key !== 'address'}
             onChange={event => setValues({ ...values, [key]: event.target.value })} />
      {errors[key] && <small>{errors[key]}</small>}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="page-content">
        <header className="page-heading">
          <h1>Admin overview</h1>
          <p>Accounts, stores, and submitted ratings at a glance.</p>
        </header>
        <section className="stats-grid" aria-label="Platform totals">
          <article className="stat-card"><span>Total users</span><strong>{stats.totalUsers}</strong></article>
          <article className="stat-card"><span>Total stores</span><strong>{stats.totalStores}</strong></article>
          <article className="stat-card"><span>Submitted ratings</span><strong>{stats.totalRatings}</strong></article>
        </section>
        {msg && <p className={`message ${msgType}`} role={msgType === 'error' ? 'alert' : 'status'}>{msg}</p>}

        <section className="page-section">
          <div className="section-heading">
            <h2>Administration</h2>
            <p className="muted">Create accounts and add stores to the platform.</p>
          </div>
          <div className="admin-forms">
            <section className="form-panel">
              <h3>Add user</h3>
              <p className="muted">The email configured as ADMIN_EMAIL is always assigned the administrator role.</p>
              <form onSubmit={addUser}>
                <div className="form-grid">
                  {['name', 'email', 'address', 'password'].map(key => field(u, setU, uErr, key, 'user'))}
                </div>
                <label className="field" htmlFor="user-role">
                  Role
                  <select id="user-role" value={u.role}
                          onChange={event => setU({ ...u, role: event.target.value })}>
                    <option value="USER">Normal user</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="OWNER">Store owner</option>
                  </select>
                </label>
                <button type="submit">Create user</button>
              </form>
            </section>

            <section className="form-panel">
              <h3>Add store</h3>
              <form onSubmit={addStore}>
                <div className="form-grid">
                  {['name', 'email', 'address'].map(key => field(s, setS, sErr, key, 'store'))}
                </div>
                <label className="field" htmlFor="store-owner">
                  Store owner
                  <select id="store-owner" required value={s.ownerId}
                          onChange={event => setS({ ...s, ownerId: event.target.value })}>
                    <option value="">Choose an owner</option>
                    {owners.map(owner => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                  </select>
                  {sErr.ownerId && <small>{sErr.ownerId}</small>}
                </label>
                <button type="submit">Create store</button>
              </form>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}