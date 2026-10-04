import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { errMsg, validateUser } from '../validators';

export default function Signup() {
  const [f, setF] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const change = e => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const errs = validateUser(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    setServerMsg('');
    try {
      await api.post('/auth/signup', f);
      nav('/login');
    } catch (err) {
      setServerMsg(errMsg(err));
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <h1>Create account</h1>
        <p>Register as a store rating user.</p>
        <form onSubmit={submit}>
          {['name', 'email', 'address', 'password'].map(key => {
            const id = `signup-${key}`;
            const labels = { name: 'Full name', email: 'Email', address: 'Address', password: 'Password' };
            return (
              <div className="field" key={key}>
                <label htmlFor={id}>{labels[key]}</label>
                <input id={id} name={key}
                       type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                       autoComplete={key === 'password' ? 'new-password' : key}
                       minLength={key === 'name' ? 20 : key === 'password' ? 8 : undefined}
                       maxLength={key === 'name' ? 60 : key === 'address' ? 400 : key === 'password' ? 16 : undefined}
                       required={key !== 'address'} value={f[key]} onChange={change} />
                {errors[key] && <small>{errors[key]}</small>}
              </div>
            );
          })}
          {serverMsg && <p className="message error" role="alert">{serverMsg}</p>}
          <div className="auth-actions">
            <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</button>
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </section>
    </main>
  );
}