<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <div class="flex">
      <!-- Compact Sidebar -->
      <aside :class="['bg-white/90 backdrop-blur-lg border-r border-emerald-100 w-56 shrink-0 flex flex-col shadow-lg fixed h-screen z-10', sidebarOpen ? 'flex' : 'hidden md:flex']">
        <!-- Sidebar Header -->
        <div class="h-12 flex items-center px-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              </svg>
            </div>
            <div>
              <div class="font-bold text-sm text-white tracking-tight">CrickArena</div>
              <div class="text-[10px] text-emerald-100">Coach Portal</div>
            </div>
          </div>
        </div>

        <!-- Coach Info Card -->
        <div class="p-3 border-b border-emerald-100">
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2.5 border border-emerald-100">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-800 truncate text-sm">{{ coachData?.fullName || 'Coach' }}</div>
                <div class="text-xs text-slate-500 truncate" v-if="coachData?.currentClub">
                  {{ coachData.currentClub.clubName || coachData.currentClub.name }}
                </div>
                <div class="text-xs text-slate-500 truncate" v-else>
                  {{ coachData?.address?.city && coachData?.address?.district ? `${coachData.address.city}, ${coachData.address.district}` : 'Cricket Coach' }}
                </div>
              </div>
            </div>
            <div class="mt-2">
              <span v-if="coachData" :class="[
                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
                coachData.currentClub ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              ]">
                {{ coachData.currentClub ? '● Associated' : '○ Available' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <RouterLink 
            :to="{ name: 'coach-panel' }" 
            class="nav-link group"
            :class="isActive('coach-panel')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <span class="nav-text">Dashboard</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-analytics' }" 
            class="nav-link group"
            :class="isActive('coach-panel-analytics')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span class="nav-text">Analytics</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-sessions' }" 
            class="nav-link group"
            :class="isActive('coach-panel-sessions')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="nav-text">Sessions</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-players' }" 
            class="nav-link group"
            :class="isActive('coach-panel-players')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              </svg>
            </div>
            <span class="nav-text">Players</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-messages' }" 
            class="nav-link group"
            :class="isActive('coach-panel-messages')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <span class="nav-text">Messages</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-goals' }" 
            class="nav-link group"
            :class="isActive('coach-panel-goals')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <span class="nav-text">Goals</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-feedback' }" 
            class="nav-link group"
            :class="isActive('coach-panel-feedback')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
            </div>
            <span class="nav-text">Feedback</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-matches' }" 
            class="nav-link group"
            :class="isActive('coach-panel-matches')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <span class="nav-text">Matches</span>
          </RouterLink>

          <RouterLink 
            :to="{ name: 'coach-panel-profile' }" 
            class="nav-link group"
            :class="isActive('coach-panel-profile')"
            @click="sidebarOpen = false"
          >
            <div class="nav-icon-wrapper">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <span class="nav-text">Profile</span>
          </RouterLink>
        </nav>

        <!-- User Profile Section -->
        <div class="p-2 border-t border-emerald-100">
          <div class="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-lg p-2 border border-slate-200">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow">
                {{ userInitials }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-slate-800 truncate">
                  {{ auth.userProfile?.name || auth.user?.email || 'Coach' }}
                </div>
                <div class="text-[10px] text-slate-500">Cricket Coach</div>
              </div>
              <button @click="logout" class="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group" title="Logout">
                <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Mobile Overlay -->
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-50 md:hidden" @click="sidebarOpen = false"></div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 ml-0 md:ml-56">
        <!-- Compact Top Header -->
        <header class="h-12 bg-white/90 backdrop-blur-lg border-b border-emerald-100 shadow-sm flex items-center justify-between px-3 lg:px-5">
          <div class="flex items-center gap-3">
            <button @click="sidebarOpen = !sidebarOpen" class="md:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <h1 class="text-base font-bold text-slate-800">{{ getPageTitle() }}</h1>
              <p class="text-xs text-slate-500 hidden sm:block">
                {{ coachData?.fullName || 'Coach Dashboard' }}
                <span v-if="coachData?.address?.city && coachData?.address?.district" class="text-slate-400"> • {{ coachData.address.city }}</span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Notifications -->
            <button class="p-2 rounded-lg hover:bg-emerald-50 transition-colors relative" title="Notifications">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            
            <!-- Back to Site -->
            <RouterLink :to="{ name: 'home' }" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-medium transition-all shadow-sm hover:shadow">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>Home</span>
            </RouterLink>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-3 lg:p-5 overflow-y-auto bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
          <router-view :coach-data="coachData" :applications="applications" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const sidebarOpen = ref(false);
const coachData = ref(null);
const applications = ref([]);

// Initialize auth if needed
onMounted(async () => {
  if (!auth.initialized) {
    try {
      await auth.init?.();
    } catch (e) {
      console.error('Auth init failed:', e);
    }
  }

  await Promise.all([
    loadCoachData(),
    loadCoachApplications()
  ]);
});

async function loadCoachData() {
  try {
    const response = await axios.get(`${API}/coaches/profile`, { withCredentials: true });
    coachData.value = response.data.coach;
  } catch (error) {
    console.error('Error loading coach data:', error);
  }
}

async function loadCoachApplications() {
  try {
    const response = await axios.get(`${API}/coaches/applications`, { withCredentials: true });
    applications.value = response.data.applications || [];
  } catch (error) {
    console.error('Error loading coach applications:', error);
    applications.value = [];
  }
}

// Navigation helpers
const isActive = (routeName) => {
  return route.name === routeName ? 'active' : '';
};

const getPageTitle = () => {
  const titles = {
    'coach-panel': 'Dashboard',
    'coach-panel-analytics': 'Analytics',
    'coach-panel-sessions': 'Sessions',
    'coach-panel-players': 'Players',
    'coach-panel-goals': 'Goals',
    'coach-panel-feedback': 'Feedback',
    'coach-panel-matches': 'Matches',
    'coach-panel-profile': 'Profile'
  };
  return titles[route.name] || 'Coach Portal';
};

// User helpers
const userInitials = computed(() => {
  const name = auth.userProfile?.name || auth.user?.email?.split('@')[0] || 'C';
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

// Logout function
const logout = async () => {
  await auth.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150 text-sm;
}

.nav-link.active {
  @apply bg-emerald-100 text-emerald-700 font-medium;
}

.nav-icon-wrapper {
  @apply w-6 h-6 flex items-center justify-center rounded-md bg-slate-100/80 group-hover:bg-emerald-100 transition-colors;
}

.nav-link.active .nav-icon-wrapper {
  @apply bg-emerald-200;
}

.nav-text {
  @apply text-xs font-medium flex-1;
}

/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
  margin: 6px 0;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.3);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(16, 185, 129, 0.5);
}
</style>