import './App.css';
import { Route, Routes } from 'react-router-dom';
import { BootingPage, DashboardPage, ProfilePage, SettingsPage, NotFoundPage, OAuthPage, SyncPage } from './pages';

function App() {

  // TODO: add guards to prevent manual navigation to pages
  return (
    <Routes>
      <Route path="/" element={<BootingPage />} />
      <Route path="/oauth" element={<OAuthPage />} />
      <Route path="/sync" element={<SyncPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App;
