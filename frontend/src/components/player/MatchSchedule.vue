<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Match & Schedule</h2>
      <div class="flex gap-3">
        <select
          v-model="filterType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming Only</option>
          <option value="matches">Matches Only</option>
          <option value="training">Training Only</option>
        </select>
        <button
          @click="refreshSchedule"
          class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Upcoming Events Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 rounded-xl p-4">
        <p class="text-sm text-blue-800">Next Event</p>
        <p class="text-lg font-bold text-blue-900">{{ nextEvent?.title || 'None scheduled' }}</p>
        <p class="text-xs text-blue-700">{{ nextEvent ? formatDate(nextEvent.date) + ' at ' + nextEvent.time : '' }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4">
        <p class="text-sm text-green-800">Upcoming Matches</p>
        <p class="text-2xl font-bold text-green-900">{{ upcomingMatchesCount }}</p>
      </div>
      <div class="bg-purple-50 rounded-xl p-4">
        <p class="text-sm text-purple-800">Training Sessions</p>
        <p class="text-2xl font-bold text-purple-900">{{ upcomingTrainingCount }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading schedule...</p>
    </div>

    <!-- No Events -->
    <div v-else-if="filteredSchedule.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-500">No events scheduled</p>
      <p class="text-sm text-gray-400 mt-1">Your coach will schedule events soon</p>
    </div>

    <!-- Schedule List -->
    <div v-else class="space-y-4">
      <div
        v-for="event in filteredSchedule"
        :key="event.id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              :class="{
                'bg-green-100 text-green-800': event.type === 'match',
                'bg-blue-100 text-blue-800': event.type === 'training'
              }"
              class="w-12 h-12 rounded-full flex items-center justify-center"
            >
              <svg v-if="event.type === 'match'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ event.title }}</h3>
              <p class="text-sm text-gray-600">{{ event.description }}</p>
            </div>
          </div>
          <div>
            <span
              :class="{
                'bg-green-100 text-green-800': event.type === 'match',
                'bg-blue-100 text-blue-800': event.type === 'training'
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ event.type.charAt(0).toUpperCase() + event.type.slice(1) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <p class="text-gray-500">Date</p>
            <p class="font-medium">{{ formatDate(event.date) }}</p>
          </div>
          <div>
            <p class="text-gray-500">Time</p>
            <p class="font-medium">{{ event.time }}</p>
          </div>
          <div>
            <p class="text-gray-500">Venue</p>
            <p class="font-medium">{{ event.venue }}</p>
          </div>
        </div>

        <div v-if="event.role || event.notes" class="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          <p v-if="event.role" class="font-medium text-gray-900">Role: {{ event.role }}</p>
          <p v-if="event.notes" class="text-gray-600 mt-1">{{ event.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Calendar View Toggle -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">Calendar View</h3>
        <button
          @click="toggleCalendarView"
          class="text-sm text-green-600 hover:text-green-800"
        >
          {{ showCalendar ? 'Hide Calendar' : 'Show Calendar' }}
        </button>
      </div>
      
      <div v-if="showCalendar" class="border border-gray-200 rounded-xl p-4">
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center text-sm font-medium text-gray-500 py-2">
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="h-24 border border-gray-100 p-1 text-xs"
            :class="{ 'bg-gray-50': day.isCurrentMonth, 'text-gray-400': !day.isCurrentMonth }"
          >
            <div class="font-medium" :class="{ 'text-green-600': day.isToday }">{{ day.day }}</div>
            <div class="mt-1 space-y-1">
              <div
                v-for="event in day.events"
                :key="event.id"
                :class="{
                  'bg-green-100 text-green-800': event.type === 'match',
                  'bg-blue-100 text-blue-800': event.type === 'training'
                }"
                class="px-1 py-0.5 rounded truncate"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
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

const loading = ref(false);
const scheduleData = ref([]);
const filterType = ref('upcoming');
const showCalendar = ref(false);

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});

const filteredSchedule = computed(() => {
  let filtered = scheduleData.value;
  
  if (filterType.value === 'upcoming') {
    const now = new Date();
    filtered = filtered.filter(event => new Date(event.date) >= now);
  } else if (filterType.value === 'matches') {
    filtered = filtered.filter(event => event.type === 'match');
  } else if (filterType.value === 'training') {
    filtered = filtered.filter(event => event.type === 'training');
  }
  
  // Sort by date
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return filtered;
});

const nextEvent = computed(() => {
  if (filteredSchedule.value.length === 0) return null;
  return filteredSchedule.value[0];
});

const upcomingMatchesCount = computed(() => {
  const now = new Date();
  return scheduleData.value.filter(event => 
    event.type === 'match' && new Date(event.date) >= now
  ).length;
});

const upcomingTrainingCount = computed(() => {
  const now = new Date();
  return scheduleData.value.filter(event => 
    event.type === 'training' && new Date(event.date) >= now
  ).length;
});

const calendarDays = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  // First day of calendar grid (Sunday of the week containing the 1st)
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());
  // Last day of calendar grid (Saturday of the week containing the last day)
  const endDay = new Date(lastDay);
  endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  
  const days = [];
  const currentDay = new Date(startDay);
  
  while (currentDay <= endDay) {
    const dateStr = currentDay.toISOString().split('T')[0];
    const events = scheduleData.value.filter(event => event.date === dateStr);
    
    days.push({
      date: dateStr,
      day: currentDay.getDate(),
      isCurrentMonth: currentDay.getMonth() === month,
      isToday: currentDay.toDateString() === today.toDateString(),
      events
    });
    
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  return days;
});

const loadScheduleData = async () => {
  loading.value = true;
  try {
    // Fetch player's schedule data from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's schedule
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      // Get training sessions from the coach
      const coachResponse = await axios.get(`${API}/coaches/profile`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const coachData = coachResponse.data.coach;
      
      // Get sessions from all training programs
      const allSessions = [];
      for (const program of coachData.trainingPrograms) {
        const sessionsResponse = await axios.get(`${API}/coaches/sessions/${program._id}`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        // Add program info to each session
        const programSessions = sessionsResponse.data.sessions.map(session => ({
          id: session._id,
          date: session.date,
          time: `${session.startTime}-${session.endTime}`,
          type: 'training',
          title: session.focusArea,
          description: program.title,
          venue: session.location,
          notes: session.notes
        }));
        
        allSessions.push(...programSessions);
      }
      
      // Combine with match data from club
      const matchData = clubData.matches || []; // Assuming club has match data
      const matches = matchData.map(match => ({
        id: match._id,
        date: match.date,
        time: match.time,
        type: 'match',
        title: match.title || 'Match',
        description: match.description || '',
        venue: match.venue || '',
        role: playerData.preferredPosition,
        notes: match.notes || ''
      }));
      
      scheduleData.value = [...allSessions, ...matches];
    }
  } catch (error) {
    console.error('Error loading schedule data:', error);
    // Fallback to mock data if there's an error
    scheduleData.value = [
      {
        id: 1,
        date: '2023-06-20',
        time: '09:00',
        type: 'training',
        title: 'Fielding Practice',
        description: 'Focus on catching and throwing accuracy',
        venue: 'Main Ground',
        notes: 'Bring fielding gloves'
      },
      {
        id: 2,
        date: '2023-06-22',
        time: '15:00',
        type: 'match',
        title: 'Friendly Match vs Rivals',
        description: 'Pre-season friendly match',
        venue: 'City Stadium',
        role: 'Batsman',
        notes: 'Arrive 30 minutes early for warm-up'
      },
      {
        id: 3,
        date: '2023-06-25',
        time: '10:00',
        type: 'training',
        title: 'Batting Techniques',
        description: 'Work on shot selection and timing',
        venue: 'Net Area',
        notes: 'Bring your bats'
      },
      {
        id: 4,
        date: '2023-06-28',
        time: '14:00',
        type: 'match',
        title: 'Tournament Quarter Final',
        description: 'Cricket League Quarter Final',
        venue: 'Regional Ground',
        role: 'All-Rounder',
        notes: 'Team meeting at 13:30'
      }
    ];
  } finally {
    loading.value = false;
  }
};

const refreshSchedule = () => {
  loadScheduleData();
};

const toggleCalendarView = () => {
  showCalendar.value = !showCalendar.value;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadScheduleData();
});
</script>

<style scoped>
/* Custom styles */
</style>