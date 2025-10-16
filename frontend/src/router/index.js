import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import HomePage from '../pages/HomePage.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import ClubRegistration from '../pages/ClubRegistration.vue';
import ClubManagerDashboard from '../pages/ClubManagerDashboard.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import ClubManagerPanel from '../pages/ClubManagerPanel.vue';
import ClubManagerOverview from '../pages/ClubManagerOverview.vue';
import ClubManagerTournaments from '../pages/ClubManagerTournaments.vue';
import ClubManagerPlayers from '../pages/ClubManagerPlayers.vue';
import ClubManagerCoaches from '../pages/ClubManagerCoaches.vue';
import ClubManagerMatches from '../pages/ClubManagerMatches.vue';
import ClubManagerProfile from '../pages/ClubManagerProfile.vue';
import ClubManagerTrainingSessions from '../pages/ClubManagerTrainingSessions.vue'; // Added import
import ClubsList from '../pages/ClubsList.vue';
import ClubDetails from '../pages/ClubDetails.vue';
import AdminTournament from '../pages/AdminTournament.vue';
import ClubTournaments from '../pages/ClubTournaments.vue';
import UserProfile from '../pages/UserProfile.vue';
import ForgotPassword from '../pages/ForgotPassword.vue';
import ResetPassword from '../pages/ResetPassword.vue';
import HelpCenter from '../pages/HelpCenter.vue';
import ContactUs from '../pages/ContactUs.vue';
import PrivacyPolicy from '../pages/PrivacyPolicy.vue';
import TermsOfService from '../pages/TermsOfService.vue';
import TournamentDetails from '../pages/TournamentDetails.vue';
import MatchDetails from '../pages/MatchDetails.vue';
import AdminMatchEditor from '../pages/AdminMatchEditor.vue';
import TournamentsList from '../pages/TournamentsList.vue';
import Search from '../pages/Search.vue';
import PlayerRegistration from '../pages/PlayerRegistration.vue';
import PlayerDashboard from '../pages/PlayerDashboard.vue';
import PlayerPanel from '../pages/PlayerPanel.vue';
// Import new player page components
import PlayerPerformance from '../pages/player/Performance.vue';
import PlayerTraining from '../pages/player/Training.vue';
import PlayerProgress from '../pages/player/Progress.vue';
import PlayerApplications from '../pages/player/Applications.vue';
import PlayerProfile from '../pages/player/Profile.vue';

import CoachRegistration from '../pages/CoachRegistration.vue';
import CoachDashboard from '../pages/CoachDashboard.vue';
import CoachPanel from '../pages/CoachPanel.vue';
// Import new coach page components
import CoachAnalytics from '../pages/coach/CoachAnalytics.vue';
import CoachTrainingPrograms from '../pages/coach/TrainingPrograms.vue';
import CoachSessions from '../pages/coach/Sessions.vue';
import CoachPlayers from '../pages/coach/Players.vue';
import CoachPlayerDetails from '../pages/coach/PlayerDetails.vue';
import CoachProfile from '../pages/coach/Profile.vue';
import CoachMatchesAndTournaments from '../pages/coach/MatchesAndTournaments.vue'; // Added import

// OTP verification removed
// import VerifyOtp from '../pages/VerifyOtp.vue';
import { useAuthStore } from '../store/auth';
import axios from 'axios';
import AdminPanel from '../pages/AdminPanel.vue';
import AdminOverview from '../pages/AdminOverview.vue';
import AdminPlayerManagement from '../components/admin/AdminPlayerManagement.vue';
import AdminCoachManagement from '../components/admin/AdminCoachManagement.vue';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/search', name: 'search', component: Search },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/clubs', name: 'clubs', component: ClubsList },
  { path: '/clubs/:id', name: 'club-details', component: ClubDetails, props: true },
  { path: '/club-registration', name: 'club-registration', component: ClubRegistration, meta: { requiresAuth: true, requiresClubManager: true } },
  // Club Manager panel layout with nested routes
  { 
    path: '/club-manager', 
    component: ClubManagerPanel, 
    meta: { requiresAuth: true, requiresClubManager: true },
    children: [
      { path: '', name: 'club-manager', component: ClubManagerOverview },
      { path: 'tournaments', name: 'club-manager-tournaments', component: ClubManagerTournaments },
      { path: 'players', name: 'club-manager-players', component: ClubManagerPlayers },
      { path: 'coaches', name: 'club-manager-coaches', component: ClubManagerCoaches },
      { path: 'matches', name: 'club-manager-matches', component: ClubManagerMatches },
      { path: 'training-sessions', name: 'club-manager-training-sessions', component: ClubManagerTrainingSessions }, // Added route
      { path: 'profile', name: 'club-manager-profile', component: ClubManagerProfile }
    ]
  },
  // Admin panel layout with nested routes
  { 
    path: '/admin', 
    component: AdminPanel, 
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'admin', component: AdminOverview },
      { path: 'tournaments', name: 'admin-tournaments', component: AdminTournament },
      { path: 'clubs', name: 'admin-clubs', component: AdminDashboard },
      { path: 'players', name: 'admin-players', component: AdminPlayerManagement },
      { path: 'coaches', name: 'admin-coaches', component: AdminCoachManagement }
    ]
  },
  // Backward-compatible alias redirect (if any code still links to old path names)
  { path: '/admin/tournaments', redirect: { name: 'admin-tournaments' } },
  { path: '/club/tournaments', name: 'club-tournaments', component: ClubTournaments, meta: { requiresAuth: true, requiresClubManager: true } },
  { path: '/tournaments', name: 'tournaments', component: TournamentsList },
  { path: '/tournaments/:id', name: 'tournament-details', component: TournamentDetails, props: true },
  { path: '/profile', name: 'profile', component: UserProfile, meta: { requiresAuth: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },
  { path: '/reset-password/:token?', name: 'reset-password', component: ResetPassword },
  { path: '/help', name: 'help', component: HelpCenter },
  { path: '/contact', name: 'contact', component: ContactUs },
  { path: '/privacy', name: 'privacy', component: PrivacyPolicy },
  { path: '/terms', name: 'terms', component: TermsOfService },
  { path: '/explore', redirect: { name: 'home' } },

  // Public match details view
  { path: '/tournaments/:id/matches/:matchId', name: 'match-details', component: MatchDetails, props: true },
  // Admin match editor
  { path: '/admin/tournaments/:id/matches/:matchId', name: 'admin-match-editor', component: AdminMatchEditor, meta: { requiresAuth: true, requiresAdmin: true }, props: true },
  
  // Player routes
  { path: '/player/register', name: 'player-registration', component: PlayerRegistration, meta: { requiresAuth: true } },
  // Alias to support older links/components pointing to '/player/registration'
  { path: '/player/registration', redirect: { name: 'player-registration' } },
  { path: '/player/dashboard', name: 'player-dashboard', component: PlayerDashboard, meta: { requiresAuth: true, requiresPlayer: true } },
  // Player panel layout with nested routes
  { 
    path: '/player-panel', 
    component: PlayerPanel, 
    meta: { requiresAuth: true, requiresPlayer: true },
    children: [
      { path: '', name: 'player-panel', component: PlayerPerformance },
      { path: 'performance', name: 'player-panel-performance', component: PlayerPerformance },
      { path: 'training', name: 'player-panel-training', component: PlayerTraining },
      { path: 'progress', name: 'player-panel-progress', component: PlayerProgress },
      { path: 'applications', name: 'player-panel-applications', component: PlayerApplications },
      { path: 'profile', name: 'player-panel-profile', component: PlayerProfile }
    ]
  },
  
  // Coach routes
  { path: '/coach/register', name: 'coach-registration', component: CoachRegistration, meta: { requiresAuth: true } },
  // Alias to support older links/components pointing to '/coach/registration'
  { path: '/coach/registration', redirect: { name: 'coach-registration' } },
  { path: '/coach/dashboard', name: 'coach-dashboard', component: CoachDashboard, meta: { requiresAuth: true, requiresCoach: true } },
  // Coach panel layout with nested routes
  { 
    path: '/coach-panel', 
    component: CoachPanel, 
    meta: { requiresAuth: true, requiresCoach: true },
    children: [
      { path: '', name: 'coach-panel', component: CoachAnalytics },
      { path: 'analytics', name: 'coach-panel-analytics', component: CoachAnalytics },
      { path: 'programs', name: 'coach-panel-programs', component: CoachTrainingPrograms },
      { path: 'sessions', name: 'coach-panel-sessions', component: CoachSessions },
      { path: 'players', name: 'coach-panel-players', component: CoachPlayers },
      { path: 'players/:playerId', name: 'coach-panel-player-details', component: CoachPlayerDetails, props: true },
      { path: 'matches', name: 'coach-panel-matches', component: CoachMatchesAndTournaments }, // Added route
      { path: 'profile', name: 'coach-panel-profile', component: CoachProfile }
    ]
  },
  
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register }
];

const router = createRouter({ history: createWebHistory(), routes });

// Auth guard: protect dashboard, redirect logged-in users away from login/register
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  // Wait for auth store to initialize once after reload
  if (!auth.initialized) {
    try {
      await auth.init?.();
    } catch {}
  }
  const isAuthed = !!auth.user;

  const userRole = auth.userProfile?.role || 'user';
  const isAdmin = userRole === 'admin' || auth.user?.email === 'admin@crickarena.com';

  if (to.meta.requiresAuth && !isAuthed) {
    return next({ name: 'login' });
  }
  
  // Check admin access
  if (to.meta.requiresAdmin && isAuthed) {
    if (!isAdmin) {
      alert('Access denied. Admin privileges required.');
      return next({ name: 'dashboard' });
    }
  }

  // If heading to dashboard but user is admin, route them to admin panel
  if (isAuthed && isAdmin && to.name === 'dashboard') {
    return next({ name: 'admin' });
  }

  // Check club manager access for club registration
  if (to.meta.requiresClubManager && isAuthed) {
    const role = auth.userProfile?.role || 'public';
    if (role !== 'clubManager') {
      alert('Only Club Managers can register a club. Please register an account as Club Manager.');
      return next({ name: 'dashboard' });
    }
  }

  // Check player access
  if (to.meta.requiresPlayer && isAuthed) {
    const role = auth.userProfile?.role || 'public';
    if (role !== 'player') {
      alert('Player access required. Please register as a player first.');
      return next({ name: 'player-registration' });
    }

    // Check if player profile is completed
    try {
      const response = await axios.get(`${API}/players/profile`, { withCredentials: true });
      const player = response.data.player;
      if (!player || !player.profileCompleted) {
        alert('Please complete your profile before accessing the player dashboard.');
        return next({ name: 'player-registration' });
      }
    } catch (e) {
      // If no profile exists, redirect to registration
      if (e?.response?.status === 404) {
        return next({ name: 'player-registration' });
      }
      console.warn('Failed to check player profile:', e?.response?.data || e.message);
    }
  }

  // Check coach access
  if (to.meta.requiresCoach && isAuthed) {
    const role = auth.userProfile?.role || 'public';
    if (role !== 'coach') {
      alert('Coach access required. Please register as a coach first.');
      return next({ name: 'coach-registration' });
    }

    // Check if coach profile is completed
    try {
      const response = await axios.get(`${API}/coaches/profile`, { withCredentials: true });
      const coach = response.data.coach;
      if (!coach || !coach.profileCompleted) {
        alert('Please complete your profile before accessing the coach dashboard.');
        return next({ name: 'coach-registration' });
      }
    } catch (e) {
      // If no profile exists, redirect to registration
      if (e?.response?.status === 404) {
        return next({ name: 'coach-registration' });
      }
      console.warn('Failed to check coach profile:', e?.response?.data || e.message);
    }
  }

  // Prevent completed players from accessing registration page
  if (to.name === 'player-registration' && isAuthed) {
    const role = auth.userProfile?.role || 'public';
    if (role === 'player') {
      try {
        const response = await axios.get(`${API}/players/profile`, { withCredentials: true });
        const player = response.data.player;
        if (player && player.profileCompleted) {
          alert('Your profile is already completed. Redirecting to dashboard.');
          return next({ name: 'player-dashboard' });
        }
      } catch (e) {
        // If error, allow access to registration
        console.warn('Failed to check player profile for registration access:', e?.response?.data || e.message);
      }
    }
  }

  // Prevent completed coaches from accessing registration page
  if (to.name === 'coach-registration' && isAuthed) {
    const role = auth.userProfile?.role || 'public';
    if (role === 'coach') {
      try {
        const response = await axios.get(`${API}/coaches/profile`, { withCredentials: true });
        const coach = response.data.coach;
        if (coach && coach.profileCompleted) {
          alert('Your profile is already completed. Redirecting to dashboard.');
          return next({ name: 'coach-dashboard' });
        }
      } catch (e) {
        // If error, allow access to registration
        console.warn('Failed to check coach profile for registration access:', e?.response?.data || e.message);
      }
    }
  }

  // Prevent already-registered club managers from accessing registration page
  if (to.name === 'club-registration' && isAuthed) {
    const role = auth.userProfile?.role || 'public';
    if (role === 'clubManager') {
      try {
        const resp = await axios.get(`${API}/clubs/my-club`);
        if (resp?.data?.club) {
          alert('You have already registered a club.');
          return next({ name: 'club-manager' });
        }
      } catch (e) {
        // 404 means no club exists; allow access
        if (e?.response?.status !== 404) {
          console.warn('Club check failed:', e?.response?.data || e.message);
        }
      }
    }
  }
  
  if ((to.name === 'login' || to.name === 'register') && isAuthed) {
    // Send admins to admin panel; others to dashboard
    return next({ name: isAdmin ? 'admin' : 'dashboard' });
  }
  // Optional: redirect authenticated users away from public landing if desired
  if (to.name === 'home' && isAuthed && from.name !== 'login') {
    // Keep landing page accessible when they explicitly navigate; remove this block if not needed.
  }
  next();
});

export default router;