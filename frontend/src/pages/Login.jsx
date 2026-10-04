import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../useAuth';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      const { data } = await api.post('/auth/login', f);
      login(data.token, data.user);
      nav('/');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <h1>Sign in</h1>
        <p>Access your store rating account.</p>
        <form onSubmit={submit}>
          <label className="field" htmlFor="login-email">
            Email
            <input id="login-email" type="email" autoComplete="email" required
                   value={f.email} onChange={event => setF({ ...f, email: event.target.value })} />
          </label>
          <label className="field" htmlFor="login-password">
            Password
            <input id="login-password" type="password" autoComplete="current-password" required
                   value={f.password} onChange={event => setF({ ...f, password: event.target.value })} />
          </label>
          {msg && <p className="message error" role="alert">{msg}</p>}
          <div className="auth-actions">
            <button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
            <Link to="/signup">Create account</Link>
          </div>
        </form>
      </section>
    </main>
  );
}