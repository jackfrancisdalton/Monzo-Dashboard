import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const BootingPage: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/dashboard-data/is-configured`)
      .then((res) => res.json())
      .then((data) => {
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