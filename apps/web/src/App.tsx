import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Leaderboard from '@/pages/Leaderboard';
import Rewards from '@/pages/Rewards';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
