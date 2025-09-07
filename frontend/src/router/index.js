import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import HomePage from '../pages/HomePage.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import ClubRegistration from '../pages/ClubRegistration.vue';
import ClubManagerDashboard from '../pages/ClubManagerDashboard.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
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
// OTP verification removed
// import VerifyOtp from '../pages/VerifyOtp.vue';
import { useAuthStore } from '../store/auth';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/clubs', name: 'clubs', component: ClubsList },
  { path: '/clubs/:id', name: 'club-details', component: ClubDetails, props: true },
  { path: '/club-registration', name: 'club-registration', component: ClubRegistration, meta: { requiresAuth: true, requiresClubManager: true } },
  { path: '/club-manager', name: 'club-manager', component: ClubManagerDashboard, meta: { requiresAuth: true, requiresClubManager: true } },
  { path: '/admin', name: 'admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/tournaments', name: 'admin-tournaments', component: AdminTournament, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/club/tournaments', name: 'club-tournaments', component: ClubTournaments, meta: { requiresAuth: true, requiresClubManager: true } },
  { path: '/profile', name: 'profile', component: UserProfile, meta: { requiresAuth: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword },
  { path: '/reset-password/:token?', name: 'reset-password', component: ResetPassword },
  { path: '/help', name: 'help', component: HelpCenter },
  { path: '/contact', name: 'contact', component: ContactUs },
  { path: '/privacy', name: 'privacy', component: PrivacyPolicy },
  { path: '/terms', name: 'terms', component: TermsOfService },
  { path: '/explore', redirect: { name: 'home' } },
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

  if (to.meta.requiresAuth && !isAuthed) {
    return next({ name: 'login' });
  }
  
  // Check admin access
  if (to.meta.requiresAdmin && isAuthed) {
    const userRole = auth.userProfile?.role || 'user';
    const isAdmin = userRole === 'admin' || auth.user?.email === 'admin@crickarena.com';
    if (!isAdmin) {
      alert('Access denied. Admin privileges required.');
      return next({ name: 'dashboard' });
    }
  }

  // Check club manager access for club registration
  if (to.meta.requiresClubManager && isAuthed) {
    const userRole = auth.userProfile?.role || 'public';
    if (userRole !== 'clubManager') {
      alert('Only Club Managers can register a club. Please register an account as Club Manager.');
      return next({ name: 'dashboard' });
    }
  }
  
  if ((to.name === 'login' || to.name === 'register') && isAuthed) {
    return next({ name: 'dashboard' });
  }
  // Optional: redirect authenticated users away from public landing if desired
  if (to.name === 'home' && isAuthed && from.name !== 'login') {
    // Keep landing page accessible when they explicitly navigate; remove this block if not needed.
  }
  next();
});

export default router;