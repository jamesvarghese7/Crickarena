<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Welcome, {{ playerData?.fullName || 'Player' }}!</h1>
          <p class="text-green-100">Track your cricket journey and development</p>
        </div>
        <div class="text-right">
          <span 
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              playerData?.currentClub ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            ]"
          >
            <span class="w-2 h-2 mr-2 rounded-full" :class="playerData?.currentClub ? 'bg-green-500' : 'bg-yellow-500'"></span>
            {{ playerData?.currentClub ? 'Club Member' : 'No Club Membership' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Club Membership Status -->
    <div v-if="playerData" class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900">Club Membership</h2>
      </div>
      
      <div v-if="playerData.currentClub" class="bg-green-50 border border-green-200 rounded-xl p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-green-800">Current Membership</h3>
            <p class="text-green-700 mt-1">
              You are a member of <strong>{{ playerData.currentClub.name || playerData.currentClub.clubName }}</strong> in {{ playerData.currentClub.district }}, {{ playerData.currentClub.city }}.
            </p>
            <div class="mt-2 flex items-center text-sm text-green-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Since {{ formatDate(playerData.joinedDate) }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-yellow-800">No Club Membership</h3>
            <p class="text-yellow-700 mt-1">
              You are not currently a member of any club. Apply to clubs to join their training programs.
            </p>
            <div class="mt-3">
              <button 
                @click="$router.push({ name: 'player-panel-applications' })"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Apply to Clubs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Training Sessions</h3>
            <p class="text-2xl font-bold text-gray-900">24</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-green-100">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Attendance</h3>
            <p class="text-2xl font-bold text-gray-900">87%</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-purple-100">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Performance</h3>
            <p class="text-2xl font-bold text-gray-900">85%</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-yellow-100">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Programs</h3>
            <p class="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Overview -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">Batting Skills</span>
            <span class="text-sm font-medium text-gray-700">78%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: 78%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">Bowling Skills</span>
            <span class="text-sm font-medium text-gray-700">65%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: 65%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">Fielding Skills</span>
            <span class="text-sm font-medium text-gray-700">82%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full" style="width: 82%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">Fitness Level</span>
            <span class="text-sm font-medium text-gray-700">90%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-yellow-600 h-2 rounded-full" style="width: 90%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      <div class="space-y-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">Attended batting practice session</p>
            <p class="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">Completed fitness assessment</p>
            <p class="text-xs text-gray-500">Yesterday</p>
          </div>
        </div>
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">Updated training goals</p>
            <p class="text-xs text-gray-500">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Define props properly
const props = defineProps({
  playerData: {
    type: Object,
    default: null
  }
});

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>