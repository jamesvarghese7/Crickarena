<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Reports & Insights</h2>
      <div class="flex gap-3">
        <select
          v-model="timeRange"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
        <button
          @click="exportReport"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-50 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-800">Total Players</p>
            <p class="text-2xl font-bold text-blue-900">{{ insights.totalPlayers }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-800">Avg. Attendance</p>
            <p class="text-2xl font-bold text-green-900">{{ insights.avgAttendance }}%</p>
          </div>
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-800">Training Sessions</p>
            <p class="text-2xl font-bold text-purple-900">{{ insights.trainingSessions }}</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-yellow-800">Player Progress</p>
            <p class="text-2xl font-bold text-yellow-900">{{ insights.avgProgress }}%</p>
          </div>
          <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <!-- Attendance Trend -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4">Attendance Trend</h3>
        <div class="h-64 flex items-end justify-between gap-2">
          <div
            v-for="(data, index) in attendanceData"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div
              class="w-full bg-green-500 rounded-t hover:bg-green-600 transition"
              :style="{ height: data.value + '%' }"
            ></div>
            <span class="text-xs text-gray-500 mt-2">{{ data.label }}</span>
          </div>
        </div>
      </div>

      <!-- Skill Development -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4">Skill Development Overview</h3>
        <div class="space-y-4">
          <div
            v-for="skill in skillDevelopment"
            :key="skill.name"
            class="space-y-2"
          >
            <div class="flex justify-between">
              <span class="text-sm font-medium">{{ skill.name }}</span>
              <span class="text-sm font-bold text-green-600">{{ skill.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full"
                :style="{ width: skill.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Progress Highlights -->
    <div class="border border-gray-200 rounded-xl p-4 mb-8">
      <h3 class="font-semibold text-gray-900 mb-4">Player Progress Highlights</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="player in topPerformers"
          :key="player.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-800 font-bold">{{ player.name.charAt(0) }}</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ player.name }}</h4>
              <p class="text-sm text-gray-600">{{ player.position }}</p>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Progress</span>
              <span class="font-medium">{{ player.progress }}%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Attendance</span>
              <span class="font-medium">{{ player.attendance }}%</span>
            </div>
          </div>
          <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-green-600 h-2 rounded-full"
              :style="{ width: player.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Participation Stats -->
    <div class="border border-gray-200 rounded-xl p-4">
      <h3 class="font-semibold text-gray-900 mb-4">Participation Statistics</h3>
      <div class="grid md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-3xl font-bold text-gray-900">{{ participationStats.onTime }}</p>
          <p class="text-gray-600">On Time</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-3xl font-bold text-gray-900">{{ participationStats.late }}</p>
          <p class="text-gray-600">Late Arrivals</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-3xl font-bold text-gray-900">{{ participationStats.absent }}</p>
          <p class="text-gray-600">Absent</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const timeRange = ref('30');

const insights = ref({
  totalPlayers: 0,
  avgAttendance: 0,
  trainingSessions: 0,
  avgProgress: 0
});

const attendanceData = ref([
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 0 },
  { label: 'Wed', value: 0 },
  { label: 'Thu', value: 0 },
  { label: 'Fri', value: 0 },
  { label: 'Sat', value: 0 },
  { label: 'Sun', value: 0 }
]);

const skillDevelopment = ref([
  { name: 'Batting Technique', progress: 0 },
  { name: 'Bowling Accuracy', progress: 0 },
  { name: 'Fielding Skills', progress: 0 },
  { name: 'Fitness Level', progress: 0 },
  { name: 'Mental Strength', progress: 0 }
]);

const topPerformers = ref([]);

const participationStats = ref({
  onTime: 0,
  late: 0,
  absent: 0
});

const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

const exportReport = () => {
  // In a real implementation, this would generate and download a report
  alert('Report exported successfully');
};

onMounted(() => {
  // Load actual data based on time range
  console.log('Loading reports for', timeRange.value, 'days');
});
</script>

<style scoped>
/* Custom styles */
</style>