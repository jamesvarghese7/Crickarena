<template>
  <div class="space-y-4">
    <!-- Welcome Header with Gradient -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-xl">
      <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div class="relative z-10 flex items-center justify-between">
        <div>
          <h1 class="text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Welcome back, {{ auth.userProfile?.name || 'Club Manager' }}!
          </h1>
          <p class="text-blue-100 text-sm font-medium">
            {{ clubData?.clubName || 'Your Club' }} Management Dashboard
          </p>
          <div v-if="clubData" class="mt-2">
            <span :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg',
              clubData.status === 'approved' ? 'bg-green-500 text-white' :
              clubData.status === 'pending' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            ]">
              <svg v-if="clubData.status === 'approved'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg v-else-if="clubData.status === 'pending'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              Club Status: {{ clubData.status?.charAt(0).toUpperCase() + clubData.status?.slice(1) }}
            </span>
          </div>
        </div>
        <div class="hidden lg:block">
          <div class="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-lg shadow-blue-500/10 border border-blue-100/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 group">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{{ stats.players || 0 }}</div>
            <div class="text-xs font-medium text-slate-600 mt-0.5">Active Players</div>
            <div class="text-xs text-green-600 font-semibold mt-1">+12% this month</div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-lg shadow-green-500/10 border border-green-100/50 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 group">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">{{ stats.tournaments || 0 }}</div>
            <div class="text-xs font-medium text-slate-600 mt-0.5">Tournament Applications</div>
            <div class="text-xs text-green-600 font-semibold mt-1">
              {{ stats.approvedTournaments || 0 }} approved
              <span v-if="stats.pendingTournaments" class="text-yellow-600 ml-2">{{ stats.pendingTournaments }} pending</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-lg shadow-orange-500/10 border border-orange-100/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 group">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{{ stats.pendingApplications || 0 }}</div>
            <div class="text-xs font-medium text-slate-600 mt-0.5">Pending Applications</div>
            <div class="text-xs text-orange-600 font-semibold mt-1">Needs review</div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-lg shadow-purple-500/10 border border-purple-100/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{{ stats.upcomingMatches || 0 }}</div>
            <div class="text-xs font-medium text-slate-600 mt-0.5">Upcoming Matches</div>
            <div class="text-xs text-blue-600 font-semibold mt-1">Next: Tomorrow</div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Recent Activity Row -->
    <div class="grid lg:grid-cols-2 gap-4">
      <!-- Quick Actions -->
      <div class="bg-white rounded-xl p-5 shadow-lg shadow-slate-500/10 border border-slate-100/50">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h2 class="text-base font-bold text-slate-900">Quick Actions</h2>
        </div>
        
        <div class="grid gap-2">
          <RouterLink :to="{ name: 'club-manager-profile' }" class="group block p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Manage Club Profile</div>
                <div class="text-xs text-slate-500">Update club information and settings</div>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </RouterLink>

          <RouterLink :to="{ name: 'club-manager-tournaments' }" class="group block p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-300">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 group-hover:text-green-600 transition-colors">Tournament Registration</div>
                <div class="text-xs text-slate-500">Join upcoming tournaments and events</div>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </RouterLink>

          <RouterLink :to="{ name: 'club-manager-players' }" class="group block p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">Player Applications</div>
                <div class="text-xs text-slate-500">Review and manage player requests</div>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl p-5 shadow-lg shadow-slate-500/10 border border-slate-100/50">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-base font-bold text-slate-900">Recent Activity</h2>
        </div>
        
        <div v-if="recentActivity.length === 0" class="text-center py-8">
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-sm text-slate-500 font-medium">No recent activity</p>
          <p class="text-xs text-slate-400 mt-0.5">Activity will appear here as you manage your club</p>
        </div>
        
        <div v-else class="space-y-2">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md',
              getActivityIconClass(activity.type)
            ]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActivityIconPath(activity.icon)"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ activity.message }}</p>
              <p class="text-xs text-slate-500">{{ formatDate(activity.timestamp) }}</p>
            </div>
            <div v-if="getActivityBadge(activity.type)" :class="[
              'px-2 py-0.5 rounded-full text-xs font-semibold',
              getActivityBadge(activity.type).class
            ]">
              {{ getActivityBadge(activity.type).text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Chart Placeholder -->
    <div class="bg-white rounded-xl p-5 shadow-lg shadow-slate-500/10 border border-slate-100/50">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h2 class="text-base font-bold text-slate-900">Club Performance</h2>
        </div>
        <select class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Last year</option>
        </select>
      </div>
      
      <div class="h-48 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
        <div class="text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p class="text-sm text-slate-600 font-medium">Performance Analytics</p>
          <p class="text-xs text-slate-500 mt-0.5">Charts and insights coming soon</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import api from '../utils/api.js';

const auth = useAuthStore();
const clubData = ref(null);
const stats = ref({
  players: 0,
  tournaments: 0,
  pendingApplications: 0,
  upcomingMatches: 0
});
const recentActivity = ref([]);

onMounted(async () => {
  await loadData();
});

async function loadData() {
  try {
    // Load club data
    const clubResponse = await api.get('/clubs/my-club');
    clubData.value = clubResponse.data.club;

    // Load club statistics
    try {
      const statsResponse = await api.get('/clubs/my-club/stats');
      stats.value = statsResponse.data.stats;
    } catch (statsError) {
      console.warn('Failed to load club stats:', statsError);
      // Fallback to basic data from club
      if (clubData.value) {
        stats.value = {
          players: clubData.value.memberCount || 0,
          tournaments: 0,
          pendingApplications: 0,
          upcomingMatches: 0
        };
      }
    }

    // Load recent activity
    try {
      const activityResponse = await api.get('/clubs/my-club/activity');
      recentActivity.value = activityResponse.data.activity;
    } catch (activityError) {
      console.warn('Failed to load club activity:', activityError);
      // Fallback to basic activity from club data
      if (clubData.value) {
        recentActivity.value = [
          {
            id: 1,
            type: 'club',
            message: `Club "${clubData.value.clubName}" status: ${clubData.value.status}`,
            timestamp: clubData.value.submittedAt || new Date().toISOString()
          }
        ];
      }
    }

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getActivityIconClass(type) {
  const iconClasses = {
    'registration': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'approval': 'bg-gradient-to-br from-green-500 to-green-600',
    'rejection': 'bg-gradient-to-br from-red-500 to-red-600',
    'player-application': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'player-approved': 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'player-rejected': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'tournament': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'tournament-approved': 'bg-gradient-to-br from-green-500 to-green-600',
    'tournament-rejected': 'bg-gradient-to-br from-red-500 to-red-600',
    'club': 'bg-gradient-to-br from-slate-500 to-slate-600'
  };
  return iconClasses[type] || 'bg-gradient-to-br from-slate-500 to-slate-600';
}

function getActivityIconPath(icon) {
  const iconPaths = {
    'upload': 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    'check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'x': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    'user-plus': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    'user-check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'user-x': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  };
  return iconPaths[icon] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
}

function getActivityBadge(type) {
  const badges = {
    'player-application': { text: 'New', class: 'bg-purple-100 text-purple-700' },
    'player-approved': { text: 'Approved', class: 'bg-green-100 text-green-700' },
    'player-rejected': { text: 'Rejected', class: 'bg-red-100 text-red-700' },
    'tournament-approved': { text: 'Approved', class: 'bg-green-100 text-green-700' },
    'tournament-rejected': { text: 'Rejected', class: 'bg-red-100 text-red-700' },
    'approval': { text: 'Approved', class: 'bg-green-100 text-green-700' },
    'rejection': { text: 'Rejected', class: 'bg-red-100 text-red-700' }
  };
  return badges[type] || null;
}
</script>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-4 > * {
  animation: fadeInUp 0.5s ease-out;
}

.space-y-4 > *:nth-child(2) {
  animation-delay: 0.1s;
}

.space-y-4 > *:nth-child(3) {
  animation-delay: 0.15s;
}

.space-y-4 > *:nth-child(4) {
  animation-delay: 0.2s;
}
</style>