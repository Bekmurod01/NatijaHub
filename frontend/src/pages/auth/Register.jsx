import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import Spinner from '../../components/Spinner';
import { theme } from '../../theme';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await register(email, password, role);
      setSuccess('Registration successful!');
    } catch (err) {
      // Try to extract a specific error message
      let msg = 'Registration failed';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (typeof err?.message === 'string') {
        msg = err.message;
      }
      // Detect rate limit error
      if (/rate limit/i.test(msg) || /security purposes/i.test(msg)) {
        setCooldown(60); // 60 seconds cooldown
        msg = 'Too many requests. Please wait a minute before trying again.';
      }
      setError(msg);
    }
    setLoading(false);
  };

  // Cooldown timer effect
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 360, width: '100%' }}>
        <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 24, marginBottom: theme.spacing(2) }}>Register</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <select value={role} onChange={e => setRole(e.target.value)} style={{
            padding: theme.spacing(1),
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.colors.border}`,
            fontSize: 16,
            fontFamily: theme.fontFamily,
            background: theme.colors.glass,
            color: theme.colors.text,
            outline: 'none',
            marginBottom: theme.spacing(1),
          }}>
            <option value="student">Student</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
          <Btn type="submit" disabled={loading || cooldown > 0}>
            {loading ? <Spinner size={18} /> : cooldown > 0 ? `Wait ${cooldown}s` : 'Register'}
          </Btn>
        </form>
        {error && <div style={{ color: theme.colors.danger, marginTop: 8, whiteSpace: 'pre-line' }}>{error}</div>}
        {success && <div style={{ color: theme.colors.success, marginTop: 8 }}>{success}</div>}
      </Card>
    </div>
  );
};

export default Register;
