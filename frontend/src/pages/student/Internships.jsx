import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import InternshipCard from '../../components/InternshipCard';
import Spinner from '../../components/Spinner';
import { theme } from '../../theme';

const StudentInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/internships').then(res => {
      setInternships(res.data);
      setLoading(false);
    });
  }, []);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar role="student" />
      <main style={{ flex: 1, padding: theme.spacing(4) }}>
        <h2 style={{ fontFamily: theme.fontFamily, fontWeight: 700, fontSize: 28, marginBottom: theme.spacing(2) }}>Internships</h2>
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

export default StudentInternships;
