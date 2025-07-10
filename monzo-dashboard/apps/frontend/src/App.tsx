import './App.css';
import { Route, Routes } from 'react-router-dom';
import { BootingPage, DashboardPage, SetUpPage, ProfilePage, SettingsPage, NotFoundPage } from './pages';

function App() {

  // TODO: add guards to prevent manual navigation to pages
  return (
    <Routes>
      <Route path="/" element={<BootingPage />} />
      <Route path="/setup" element={<SetUpPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App;
