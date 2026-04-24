import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import InternshipCard from '../../components/InternshipCard';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import Spinner from '../../components/Spinner';
import { theme } from '../../theme';

const CompanyInternships = () => {
  const [internships, setInternships] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/company/internships').then(res => {
      setInternships(res.data);
      setLoading(false);
    });
  }, [refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/company/internships', { title, description: desc });
    setTitle(''); setDesc(''); setRefresh(r => !r);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar role="company" />
      <main style={{ flex: 1, padding: theme.spacing(4) }}>
        <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 28, marginBottom: theme.spacing(2) }}>My Internships</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: theme.spacing(2), marginBottom: theme.spacing(3) }}>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
          <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" required />
          <Btn type="submit">Create Internship</Btn>
        </form>
        {loading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: theme.spacing(3) }}>
            {internships.map(i => (
              <InternshipCard
                key={i.id}
                logo={i.company_logo}
                title={i.title}
                location={i.location}
                salary={i.salary}
                tags={i.tags}
                isFavorite={i.isFavorite}
                onApply={() => alert('Apply logic')}
                onFavorite={() => {}}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyInternships;
