<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg flex flex-col">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800">Coach Dashboard</h1>
        <p class="text-sm text-gray-600 mt-1">{{ clubName }}</p>
      </div>
      
      <nav class="flex-1 px-4 py-6">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.key">
            <button
              @click="activeModule = item.key"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition',
                activeModule === item.key 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div class="p-4 border-t border-gray-200">
        <button 
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 capitalize">
              {{ menuItems.find(item => item.key === activeModule)?.label || 'Dashboard' }}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Manage your coaching activities and player development
            </p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ coachName }}</p>
              <p class="text-xs text-gray-500">Coach at {{ clubName }}</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {{ coachName.charAt(0) }}
            </div>
          </div>
        </div>
      </header>
      
      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-6">
        <component 
          :is="currentComponent" 
          :coach-data="coachData"
          :club-data="clubData"
          @update:coach-data="updateCoachData"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

// Import modules
import PlayerManagement from '../components/coach/PlayerManagement.vue';
import TrainingManagement from '../components/coach/TrainingManagement.vue';
import PerformanceTracker from '../components/coach/PerformanceTracker.vue';
import CommunicationPanel from '../components/coach/CommunicationPanel.vue';
import AttendanceFitness from '../components/coach/AttendanceFitness.vue';
import SchedulePlanning from '../components/coach/SchedulePlanning.vue';
import ReportsInsights from '../components/coach/ReportsInsights.vue';

// Icons
import PlayerIcon from './icons/PlayerIcon.vue';
import TrainingIcon from './icons/TrainingIcon.vue';
import PerformanceIcon from './icons/PerformanceIcon.vue';
import CommunicationIcon from './icons/CommunicationIcon.vue';
import AttendanceIcon from './icons/AttendanceIcon.vue';
import ScheduleIcon from './icons/ScheduleIcon.vue';
import ReportsIcon from './icons/ReportsIcon.vue';

const router = useRouter();
const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const activeModule = ref('players');
const coachData = ref(null);
const clubData = ref(null);

const menuItems = [
  { key: 'players', label: 'Player Management', icon: PlayerIcon },
  { key: 'training', label: 'Training Management', icon: TrainingIcon },
  { key: 'performance', label: 'Performance Tracker', icon: PerformanceIcon },
  { key: 'communication', label: 'Communication', icon: CommunicationIcon },
  { key: 'attendance', label: 'Attendance & Fitness', icon: AttendanceIcon },
  { key: 'schedule', label: 'Schedule & Planning', icon: ScheduleIcon },
  { key: 'reports', label: 'Reports & Insights', icon: ReportsIcon }
];

const currentComponent = computed(() => {
  const components = {
    players: PlayerManagement,
    training: TrainingManagement,
    performance: PerformanceTracker,
    communication: CommunicationPanel,
    attendance: AttendanceFitness,
    schedule: SchedulePlanning,
    reports: ReportsInsights
  };
  return components[activeModule.value] || PlayerManagement;
});

const coachName = computed(() => coachData.value?.fullName || 'Coach');
const clubName = computed(() => clubData.value?.name || 'Your Club');

const loadCoachData = async () => {
  try {
    const response = await axios.get(`${API}/coaches/profile`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    coachData.value = response.data.coach;
    
    // Load club data if coach is associated with a club
    if (coachData.value.currentClub) {
      const clubResponse = await axios.get(`${API}/clubs/public/${coachData.value.currentClub._id}`);
      clubData.value = clubResponse.data;
    }
  } catch (error) {
    console.error('Error loading coach data:', error);
  }
};

const updateCoachData = (data) => {
  coachData.value = { ...coachData.value, ...data };
};

const logout = async () => {
  await auth.logout();
  router.push('/login');
};

onMounted(() => {
  loadCoachData();
});
</script>