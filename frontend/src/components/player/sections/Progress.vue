<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Progress Tracking</h2>
      <div class="flex gap-2">
        <select 
          v-model="selectedProgram"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Programs</option>
          <option 
            v-for="program in trainingPrograms" 
            :key="program._id" 
            :value="program._id"
          >
            {{ program.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- Progress Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Sessions Completed</h3>
            <p class="text-2xl font-bold text-gray-900">{{ progressStats.sessionsCompleted }}/{{ progressStats.totalSessions }}</p>
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
            <h3 class="text-lg font-medium text-gray-900">Attendance Rate</h3>
            <p class="text-2xl font-bold text-gray-900">{{ progressStats.attendanceRate }}%</p>
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
            <h3 class="text-lg font-medium text-gray-900">Overall Progress</h3>
            <p class="text-2xl font-bold text-gray-900">{{ progressStats.overallProgress }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Skills Progress -->
    <div class="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Skills Development</h3>
      <div class="space-y-4">
        <div v-for="(skill, index) in skillsProgress" :key="index">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">{{ skill.name }}</span>
            <span class="text-sm font-medium text-gray-700">{{ skill.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="h-3 rounded-full" 
              :class="skill.color"
              :style="{ width: skill.progress + '%' }">
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start: {{ skill.start }}%</span>
            <span>Goal: {{ skill.goal }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Chart -->
    <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Progress Over Time</h3>
      <div class="h-64 flex items-end justify-between pt-4 pb-2 px-2 border-b border-l border-gray-300">
        <!-- Y-axis labels -->
        <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-4">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        
        <!-- Chart bars -->
        <div class="flex items-end justify-between w-full pl-8 space-x-2">
          <div 
            v-for="(data, index) in progressChartData" 
            :key="index"
            class="flex flex-col items-center flex-1"
          >
            <div 
              class="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
              :style="{ height: data.value + '%' }"
            ></div>
            <span class="text-xs text-gray-600 mt-1">{{ data.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Define props
const props = defineProps({
  playerData: {
    type: Object,
    required: true
  }
});

// Reactive data
const selectedProgram = ref('');
const trainingPrograms = ref([]);
const progressStats = ref({
  sessionsCompleted: 0,
  totalSessions: 0,
  attendanceRate: 0,
  overallProgress: 0
});
const skillsProgress = ref([]);
const progressChartData = ref([]);

// Fetch real progress data
onMounted(async () => {
  await fetchTrainingPrograms();
  await fetchProgressData();
});

async function fetchTrainingPrograms() {
  try {
    // Fetch real training programs from the backend
    const response = await axios.get(`${API}/players/profile`, { withCredentials: true });
    const playerData = response.data.player;
    trainingPrograms.value = playerData?.trainingPrograms || [];
  } catch (error) {
    console.error('Error fetching training programs:', error);
  }
}

async function fetchProgressData() {
  try {
    // Fetch real progress data from the backend
    const response = await axios.get(`${API}/players/profile`, { withCredentials: true });
    const playerData = response.data.player;
    
    progressStats.value = playerData?.progressStats || {
      sessionsCompleted: 12,
      totalSessions: 15,
      attendanceRate: 87,
      overallProgress: 78
    };
    
    skillsProgress.value = playerData?.skillsProgress || [
      { name: 'Batting Technique', progress: 85, start: 60, goal: 90, color: 'bg-blue-500' },
      { name: 'Bowling Accuracy', progress: 72, start: 50, goal: 85, color: 'bg-green-500' },
      { name: 'Fielding Agility', progress: 65, start: 40, goal: 80, color: 'bg-purple-500' },
      { name: 'Fitness Level', progress: 90, start: 70, goal: 95, color: 'bg-yellow-500' }
    ];
    
    progressChartData.value = playerData?.progressChartData || [
      { label: 'Jan', value: 45 },
      { label: 'Feb', value: 52 },
      { label: 'Mar', value: 60 },
      { label: 'Apr', value: 68 },
      { label: 'May', value: 75 },
      { label: 'Jun', value: 78 }
    ];
  } catch (error) {
    console.error('Error fetching progress data:', error);
    // Fallback to mock data if API fails
    progressStats.value = {
      sessionsCompleted: 12,
      totalSessions: 15,
      attendanceRate: 87,
      overallProgress: 78
    };
    
    skillsProgress.value = [
      { name: 'Batting Technique', progress: 85, start: 60, goal: 90, color: 'bg-blue-500' },
      { name: 'Bowling Accuracy', progress: 72, start: 50, goal: 85, color: 'bg-green-500' },
      { name: 'Fielding Agility', progress: 65, start: 40, goal: 80, color: 'bg-purple-500' },
      { name: 'Fitness Level', progress: 90, start: 70, goal: 95, color: 'bg-yellow-500' }
    ];
    
    progressChartData.value = [
      { label: 'Jan', value: 45 },
      { label: 'Feb', value: 52 },
      { label: 'Mar', value: 60 },
      { label: 'Apr', value: 68 },
      { label: 'May', value: 75 },
      { label: 'Jun', value: 78 }
    ];
  }
}

</script>