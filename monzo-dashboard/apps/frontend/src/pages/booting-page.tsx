import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BootingPage: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/is-configured') // TODO: replace with env var
      .then(res => res.json())
      .then(data => {
        if (data.isConfigured) {
          navigate('/dashboard');
        } else {
          navigate('/setup');
        }
      })
      .catch(() => navigate('/setup'))
      .finally(() => setChecking(false));
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      {checking && <p>Booting up... checking current state...</p>}
    </div>
  );
};

export default BootingPage;