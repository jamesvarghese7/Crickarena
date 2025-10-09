<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Schedule & Match Planning</h2>
      <div class="flex gap-3">
        <button
          @click="viewMode = 'calendar'"
          :class="[
            'px-4 py-2 rounded-lg transition',
            viewMode === 'calendar' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Calendar
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'px-4 py-2 rounded-lg transition',
            viewMode === 'list' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          List
        </button>
        <button
          @click="showCreateModal = true"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Event
        </button>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'">
      <div class="flex items-center justify-between mb-6">
        <button
          @click="previousMonth"
          class="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ currentMonthYear }}
        </h3>
        <button
          @click="nextMonth"
          class="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="text-center py-2 font-medium text-gray-700 text-sm"
        >
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="min-h-24 border border-gray-200 p-1 relative"
          :class="{
            'bg-gray-50': !day.isCurrentMonth,
            'bg-white': day.isCurrentMonth
          }"
        >
          <div class="text-right p-1">
            <span
              :class="{
                'font-bold': day.isToday,
                'text-green-600': day.isToday
              }"
              class="text-sm"
            >
              {{ day.day }}
            </span>
          </div>
          <div class="space-y-1 mt-1">
            <div
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="text-xs p-1 rounded cursor-pointer truncate hover:opacity-90"
              :class="getEventClass(event.type)"
              @click="viewEventDetails(event)"
            >
              <span class="font-medium">{{ formatTime(event.startTime) }}</span>
              {{ event.title }}
            </div>
            <div
              v-if="day.events.length > 3"
              class="text-xs text-gray-500 p-1"
            >
              +{{ day.events.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else>
      <div class="mb-4 flex items-center gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search events..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          v-model="filterType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="training">Training</option>
          <option value="match">Match</option>
          <option value="meeting">Meeting</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div v-if="filteredEvents.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-500">No events scheduled</p>
        <p class="text-sm text-gray-400 mt-1">Add an event to get started</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div
                class="w-3 h-10 rounded-full mt-1"
                :class="getEventColor(event.type)"
              ></div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ event.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
                <div class="flex items-center gap-4 mt-2 text-sm">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ formatDate(event.date) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ event.location }}</span>
                  </div>
                </div>
                <div v-if="event.attendees" class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="attendee in event.attendees.slice(0, 5)"
                    :key="attendee.id"
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {{ attendee.name }}
                  </span>
                  <span
                    v-if="event.attendees.length > 5"
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    +{{ event.attendees.length - 5 }} more
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="editEvent(event)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                @click="deleteEvent(event.id)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Event Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              {{ showEditModal ? 'Edit Event' : 'Create Event' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveEvent" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              v-model="eventForm.title"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Training Session, Match vs Rivals"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <select
              v-model="eventForm.type"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="training">Training Session</option>
              <option value="match">Match</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="eventForm.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe the event..."
            ></textarea>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                v-model="eventForm.date"
                type="date"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                v-model="eventForm.location"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Venue name"
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                v-model="eventForm.startTime"
                type="time"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                v-model="eventForm.endTime"
                type="time"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div v-if="eventForm.type === 'match'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Opponent Team</label>
            <input
              v-model="eventForm.opponent"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Opponent team name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Assign Players</label>
            <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              <div
                v-for="player in players"
                :key="player._id"
                class="flex items-center gap-2 mb-2"
              >
                <input
                  type="checkbox"
                  :id="`player-${player._id}`"
                  :value="player._id"
                  v-model="eventForm.assignedPlayers"
                  class="rounded text-green-600 focus:ring-green-500"
                />
                <label :for="`player-${player._id}`" class="text-sm text-gray-700">{{ player.fullName }}</label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{ showEditModal ? 'Update Event' : 'Create Event' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Event Details</h3>
            <button
              @click="showDetailsModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="selectedEvent" class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-4 h-10 rounded-full"
              :class="getEventColor(selectedEvent.type)"
            ></div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedEvent.title }}</h2>
              <p class="text-gray-600 capitalize">{{ selectedEvent.type }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(selectedEvent.date) }}</span>
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</span>
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ selectedEvent.location }}</span>
            </div>
            <div v-if="selectedEvent.opponent" class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>vs {{ selectedEvent.opponent }}</span>
            </div>
          </div>

          <div v-if="selectedEvent.description" class="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 class="font-semibold text-gray-900 mb-2">Description</h4>
            <p class="text-gray-700">{{ selectedEvent.description }}</p>
          </div>

          <div v-if="selectedEvent.assignedPlayers && selectedEvent.assignedPlayers.length > 0" class="mt-6">
            <h4 class="font-semibold text-gray-900 mb-3">Assigned Players</h4>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="playerId in selectedEvent.assignedPlayers"
                :key="playerId"
                class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-800 text-sm font-bold">
                    {{ getPlayerInitials(playerId) }}
                  </span>
                </div>
                <span>{{ getPlayerName(playerId) }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showDetailsModal = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              @click="editEvent(selectedEvent)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Edit Event
            </button>
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

const viewMode = ref('calendar');
const saving = ref(false);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const searchQuery = ref('');
const filterType = ref('');
const players = ref([]);
const currentDate = ref(new Date());
const selectedEvent = ref(null);

const eventForm = ref({
  title: '',
  type: 'training',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  opponent: '',
  assignedPlayers: []
});

const events = ref([]);

const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  // First day of the calendar (Sunday of the week containing the 1st)
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());
  // Last day of the calendar (Saturday of the week containing the last day)
  const endDay = new Date(lastDay);
  endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  
  const days = [];
  const today = new Date();
  
  for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayEvents = events.value.filter(event => event.date === dateStr);
    
    days.push({
      date: dateStr,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: d.toDateString() === today.toDateString(),
      events: dayEvents
    });
  }
  
  return days;
});

const filteredEvents = computed(() => {
  let result = events.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }
  
  if (filterType.value) {
    result = result.filter(event => event.type === filterType.value);
  }
  
  // Sort by date and time
  result.sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });
  
  return result;
});

const loadPlayers = async () => {
  if (!props.coachData.currentClub) return;
  
  try {
    // Get players from the club
    const response = await axios.get(`${API}/clubs/public/${props.coachData.currentClub._id}/players`);
    players.value = response.data.players || [];
  } catch (error) {
    console.error('Error loading players:', error);
    players.value = [];
  }
};

const previousMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1);
  currentDate.value = new Date(currentDate.value);
};

const nextMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1);
  currentDate.value = new Date(currentDate.value);
};

const getEventClass = (type) => {
  const classes = {
    training: 'bg-blue-100 text-blue-800',
    match: 'bg-green-100 text-green-800',
    meeting: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return classes[type] || classes.other;
};

const getEventColor = (type) => {
  const colors = {
    training: 'bg-blue-500',
    match: 'bg-green-500',
    meeting: 'bg-purple-500',
    other: 'bg-gray-500'
  };
  return colors[type] || colors.other;
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getPlayerName = (playerId) => {
  const player = players.value.find(p => p._id === playerId);
  return player ? player.fullName : 'Unknown Player';
};

const getPlayerInitials = (playerId) => {
  const player = players.value.find(p => p._id === playerId);
  return player ? player.fullName.charAt(0) : '?';
};

const saveEvent = async () => {
  saving.value = true;
  try {
    if (showEditModal.value) {
      // Update existing event
      const index = events.value.findIndex(e => e.id === selectedEvent.value.id);
      if (index !== -1) {
        events.value[index] = { ...selectedEvent.value, ...eventForm.value };
      }
      alert('Event updated successfully');
    } else {
      // Create new event
      const newEvent = {
        id: Date.now().toString(),
        ...eventForm.value
      };
      events.value.push(newEvent);
      alert('Event created successfully');
    }

    closeModal();
  } catch (error) {
    console.error('Error saving event:', error);
    alert('Failed to save event');
  } finally {
    saving.value = false;
  }
};

const editEvent = (event) => {
  selectedEvent.value = event;
  eventForm.value = { ...event };
  showEditModal.value = true;
};

const deleteEvent = (eventId) => {
  if (!confirm('Are you sure you want to delete this event?')) return;
  
  const index = events.value.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events.value.splice(index, 1);
    alert('Event deleted successfully');
  }
};

const viewEventDetails = (event) => {
  selectedEvent.value = event;
  showDetailsModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedEvent.value = null;
  eventForm.value = {
    title: '',
    type: 'training',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    opponent: '',
    assignedPlayers: []
  };
};

onMounted(() => {
  loadPlayers();
});
</script>

<style scoped>
/* Custom styles */
</style>