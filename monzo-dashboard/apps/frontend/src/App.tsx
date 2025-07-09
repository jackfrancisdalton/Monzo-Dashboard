import './App.css';
import { Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/dashboard.page';
import ProfilePage from './pages/profile.page';
import SettingsPage from './pages/settings.page';
import NotFoundPage from './pages/not-found.page';

function App() {

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App;
