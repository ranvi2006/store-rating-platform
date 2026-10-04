import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    api.get('/owner/dashboard')
      .then(({ data: dashboard }) => {
        if (current) setData(dashboard);
      })
      .catch(() => {
        if (current) setError('Your dashboard could not be loaded. Please try again.');
      });
    return () => { current = false; };
  }, []);

  
  return (
    <>
      <Navbar />
      <main className="page-content">
        {error && <p className="message error" role="alert">{error}</p>}
        {!data ? (
          !error && <p className="empty-state">Loading your dashboard...</p>
        ) : data.stores.length === 0 ? (
          <p className="empty-state">No store is assigned to your account yet.</p>
        ) : (
          <>
            <header className="page-heading">
              <h1>Owner dashboard</h1>
              <p>Your stores and their recent ratings.</p>
            </header>
            {data.stores.map(store => (
              <section className="page-section" key={store.id} aria-labelledby={`store-${store.id}`}>
                <div className="section-heading">
                  <h2 id={`store-${store.id}`}>{store.name}</h2>
                </div>
                <section className="stats-grid" aria-label={`${store.name} rating summary`}>
                  <article className="stat-card">
                    <span>Average rating</span>
                    <strong>{store.averageRating ?? '-'}</strong>
                  </article>
                </section>
                <section className="page-section">
                  <div className="section-heading"><h3>Recent ratings</h3></div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Rating</th></tr></thead>
                      <tbody>
                        {store.raters.length ? store.raters.map(rater => (
                          <tr key={`${rater.email}-${rater.updated_at}`}>
                            <td>{rater.name}</td><td>{rater.email}</td><td>{rater.rating} / 5</td>
                          </tr>
                        )) : (
                          <tr><td className="empty-state" colSpan={3}>No ratings yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>
            ))}
          </>
        )}
      </main>
    </>
  );
}