import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LandingLayout } from './components/layout/LandingLayout'
import { GlobalFeed } from './components/feed/GlobalFeed'
import { CommunitySpace } from './components/feed/CommunitySpace'
import { Discovery } from './components/discovery/Discovery'
import { UserProfile } from './components/profile/UserProfile'
import { AuthPage } from './components/auth/AuthPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MessagesPage } from './components/chat/MessagesPage'
import { CommunitiesPage } from './components/discovery/CommunitiesPage'
import { CreateCommunityPage } from './components/discovery/CreateCommunityPage'

function App() {
  return <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/" element={<GlobalFeed />} />
        <Route path="/feed" element={<Navigate to="/" replace />} />
        <Route path="/welcome" element={<LandingLayout />} />
        <Route path="/discover" element={<Discovery />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/create" element={<CreateCommunityPage />} />
        <Route path="/communities/:id" element={<CommunitySpace />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
  </Routes>
}

export default App
