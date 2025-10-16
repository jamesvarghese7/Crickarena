<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
    
    <!-- Performance Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Training Sessions</h3>
            <p class="text-2xl font-bold text-gray-900">{{ trainingSessions }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-green-50 rounded-xl p-5 border border-green-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-green-100">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Attendance</h3>
            <p class="text-2xl font-bold text-gray-900">{{ attendanceRate }}%</p>
          </div>
        </div>
      </div>
      
      <div class="bg-purple-50 rounded-xl p-5 border border-purple-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-purple-100">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Performance</h3>
            <p class="text-2xl font-bold text-gray-900">{{ overallPerformance }}%</p>
          </div>
        </div>
      </div>
      
      <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-yellow-100">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Programs</h3>
            <p class="text-2xl font-bold text-gray-900">{{ activePrograms }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Skills Progress -->
    <div class="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Skills Progress</h3>
      <div class="space-y-4">
        <div v-for="(skill, index) in skillsProgress" :key="index">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">{{ skill.name }}</span>
            <span class="text-sm font-medium text-gray-700">{{ skill.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full" 
              :class="skill.color"
              :style="{ width: skill.progress + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Performance -->
    <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Performance</h3>
      <div class="space-y-4">
        <div 
          v-for="(activity, index) in recentActivities" 
          :key="index"
          class="flex items-start p-3 bg-white rounded-lg border border-gray-200"
        >
          <div class="flex-shrink-0 mt-1">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="activity.type === 'completed' ? 'bg-green-100' : activity.type === 'attended' ? 'bg-blue-100' : 'bg-purple-100'"
            >
              <svg 
                class="w-4 h-4" 
                :class="activity.type === 'completed' ? 'text-green-600' : activity.type === 'attended' ? 'text-blue-600' : 'text-purple-600'"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  v-if="activity.type === 'completed'" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
                <path 
                  v-else-if="activity.type === 'attended'" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
                <path 
                  v-else 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
            <p class="text-xs text-gray-500">{{ activity.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Define props
const props = defineProps({
  playerData: {
    type: Object,
    required: true
  }
});

// Reactive data
const trainingSessions = ref(0);
const attendanceRate = ref(0);
const overallPerformance = ref(0);
const activePrograms = ref(0);
const skillsProgress = ref([]);
const recentActivities = ref([]);

// Initialize with mock data
onMounted(() => {
  // In a real implementation, this data would come from the backend
  trainingSessions.value = 24;
  attendanceRate.value = 87;
  overallPerformance.value = 85;
  activePrograms.value = 2;
  
  skillsProgress.value = [
    { name: 'Batting Skills', progress: 78, color: 'bg-blue-600' },
    { name: 'Bowling Skills', progress: 65, color: 'bg-green-600' },
    { name: 'Fielding Skills', progress: 82, color: 'bg-purple-600' },
    { name: 'Fitness Level', progress: 90, color: 'bg-yellow-600' }
  ];
  
  recentActivities.value = [
    { 
      type: 'completed', 
      description: 'Completed batting practice session', 
      time: '2 hours ago' 
    },
    { 
      type: 'attended', 
      description: 'Attended fitness assessment', 
      time: 'Yesterday' 
    },
    { 
      type: 'updated', 
      description: 'Updated training goals', 
      time: '2 days ago' 
    },
    { 
      type: 'completed', 
      description: 'Finished fielding drills', 
      time: '3 days ago' 
    }
  ];
});
</script>