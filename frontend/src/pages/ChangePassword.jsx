import { useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { validatePassword, errMsg } from '../validators';

export default function ChangePassword() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const submit = async e => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setMsg('Password must be 8-16 chars with one uppercase and one special character');
      setMsgType('error');
      return;
    }
    try {
      await api.put('/auth/password', { password });
      setMsg('Password updated');
      setMsgType('success');
      setPassword('');
    } catch (err) {
      setMsg(errMsg(err));
      setMsgType('error');
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <header className="page-heading">
          <h1>Change password</h1>
          <p>Choose a password that meets the account requirements.</p>
        </header>
        <section className="form-panel password-form">
          <form onSubmit={submit}>
            <label className="field" htmlFor="new-password">
              New password
              <input id="new-password" type="password" autoComplete="new-password"
                     minLength={8} maxLength={16} required value={password}
                     onChange={event => setPassword(event.target.value)} />
            </label>
            <button type="submit">Update password</button>
          </form>
          {msg && <p className={`message ${msgType}`} role={msgType === 'error' ? 'alert' : 'status'}>{msg}</p>}
        </section>
      </main>
    </>
  );
}