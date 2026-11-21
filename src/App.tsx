import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LandingLayout } from './components/layout/LandingLayout'
import { GlobalFeed } from './components/feed/GlobalFeed'
import { CommunitySpace } from './components/feed/CommunitySpace'
import { Discovery } from './components/discovery/Discovery'
import { UserProfile } from './components/profile/UserProfile'

function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<LandingLayout />} />
      <Route path="/feed" element={<GlobalFeed />} />
      <Route path="/discover" element={<Discovery />} />
      <Route path="/communities/:id" element={<CommunitySpace />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
}

export default App
