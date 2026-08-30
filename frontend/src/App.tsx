import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import LogWorkoutPage from '@/pages/LogWorkoutPage';
import CreateRoutinePage from '@/pages/CreateRoutinePage';
import ExerciseHistoryPage from '@/pages/ExerciseHistoryPage';
import PersonalRecordsPage from '@/pages/PersonalRecordsPage';
import ExercisesPage from '@/pages/ExercisesPage';
import ExerciseDetailPage from '@/pages/ExerciseDetailPage';
import CommunityPage from '@/pages/CommunityPage';
import RoadmapPage from '@/pages/RoadmapPage';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workout" element={<LogWorkoutPage />} />
          <Route path="/workout/new" element={<CreateRoutinePage />} />
          <Route path="/history" element={<ExerciseHistoryPage />} />
          <Route path="/personal-records" element={<PersonalRecordsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />
        </Route>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
