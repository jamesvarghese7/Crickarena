<template>
  <div class="space-y-5">
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
      <div class="flex flex-col items-center justify-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
        <p class="text-slate-500 text-sm">Loading analytics data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-4 border border-red-100">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600 text-sm">{{ error }}</p>
        <button @click="fetchAnalytics" class="mt-2 text-xs text-red-700 underline">Try again</button>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
        <h2 class="text-base font-bold text-slate-800">Analytics Overview</h2>
        <p class="text-slate-500 text-xs mt-0.5">
          Track your coaching performance and player progress
          <span v-if="analytics.clubName" class="text-emerald-600"> • {{ analytics.clubName }}</span>
        </p>
      </div>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div class="flex items-center">
            <div class="p-2 rounded-lg bg-emerald-100">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-xs font-medium text-slate-600">Players Coached</h3>
              <p class="text-xl font-bold text-slate-800">{{ analytics.playersCoached }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
          <div class="flex items-center">
            <div class="p-2 rounded-lg bg-teal-100">
              <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-xs font-medium text-slate-600">Training Sessions</h3>
              <p class="text-xl font-bold text-slate-800">{{ analytics.trainingSessions }}</p>
              <p class="text-[10px] text-slate-500" v-if="analytics.completedSessions > 0">
                {{ analytics.completedSessions }} completed
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
          <div class="flex items-center">
            <div class="p-2 rounded-lg bg-cyan-100">
              <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-xs font-medium text-slate-600">Training Programs</h3>
              <p class="text-xl font-bold text-slate-800">{{ analytics.trainingPrograms }}</p>
              <p class="text-[10px] text-slate-500" v-if="analytics.activeProgramsCount > 0">
                {{ analytics.activeProgramsCount }} active
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Player Progress Chart -->
        <div class="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Player Experience Distribution</h3>
          <div v-if="analytics.playerProgressStats && analytics.playerProgressStats.length > 0" class="space-y-3">
            <div v-for="(stat, index) in analytics.playerProgressStats" :key="index">
              <div class="flex justify-between mb-1">
                <span class="text-xs font-medium text-slate-600">{{ stat.category }}</span>
                <span class="text-xs font-medium text-slate-600">{{ stat.percentage }}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-500" 
                  :class="stat.color"
                  :style="{ width: stat.percentage + '%' }">
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <p class="text-slate-400 text-xs">No player data available</p>
          </div>
        </div>

        <!-- Session Attendance Chart -->
        <div class="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Session Attendance by Type</h3>
          <div v-if="analytics.attendanceStats && analytics.attendanceStats.length > 0" class="space-y-3">
            <div v-for="(stat, index) in analytics.attendanceStats" :key="index">
              <div class="flex justify-between mb-1">
                <span class="text-xs font-medium text-slate-600">{{ stat.session }}</span>
                <span class="text-xs font-medium text-emerald-600">{{ stat.attendance }}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div 
                  class="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" 
                  :style="{ width: stat.attendance + '%' }">
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <p class="text-slate-400 text-xs">No session data available</p>
          </div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-800 mb-3">Performance Insights</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-800">Avg. Attendance</p>
              <p class="text-sm font-bold text-emerald-600">{{ analytics.avgAttendance }}%</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
            <div class="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-800">Goals Set</p>
              <p class="text-sm font-bold text-teal-600">{{ analytics.totalGoals }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
            <div class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-800">Feedback Given</p>
              <p class="text-sm font-bold text-cyan-600">{{ analytics.totalFeedback }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-800">Upcoming</p>
              <p class="text-sm font-bold text-blue-600">{{ analytics.upcomingSessions }} sessions</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Club Warning -->
      <div v-if="!analytics.hasClub" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p class="text-sm font-medium text-amber-800">No Club Associated</p>
            <p class="text-xs text-amber-700 mt-1">Associate with a club to see player statistics and more detailed analytics.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Define props
const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

// Reactive data
const loading = ref(true);
const error = ref(null);
const analytics = ref({
  playersCoached: 0,
  trainingSessions: 0,
  trainingPrograms: 0,
  activeProgramsCount: 0,
  completedSessions: 0,
  upcomingSessions: 0,
  todaySessions: 0,
  avgAttendance: 0,
  playerProgressStats: [],
  attendanceStats: [],
  totalGoals: 0,
  completedGoals: 0,
  inProgressGoals: 0,
  totalFeedback: 0,
  readFeedback: 0,
  clubName: null,
  hasClub: false
});

// Fetch analytics data from API
async function fetchAnalytics() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`${API}/coaches/analytics`, { withCredentials: true });
    analytics.value = response.data.analytics;
  } catch (err) {
    console.error('Error fetching analytics:', err);
    error.value = err.response?.data?.message || 'Failed to load analytics data';
  } finally {
    loading.value = false;
  }
}

// Fetch on mount
onMounted(() => {
  fetchAnalytics();
});
</script>