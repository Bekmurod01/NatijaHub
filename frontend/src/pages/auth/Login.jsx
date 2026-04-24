import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import Spinner from '../../components/Spinner';
import { theme } from '../../theme';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 360, width: '100%' }}>
        <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 24, marginBottom: theme.spacing(2) }}>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <Btn type="submit" disabled={loading}>{loading ? <Spinner size={18} /> : 'Login'}</Btn>
        </form>
        {error && <div style={{ color: theme.colors.danger, marginTop: 8 }}>{error}</div>}
      </Card>
    </div>
  );
};

export default Login;
