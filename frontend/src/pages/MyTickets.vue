<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-12">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">🎫 My Tickets</h1>
            <p class="text-emerald-100">View and manage your booked tickets</p>
          </div>
          <RouterLink :to="{ name: 'ticket-booking' }" class="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
            Book More Tickets
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Login Required -->
      <div v-if="!isLoggedIn" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">Login Required</h3>
        <p class="text-slate-400 mb-4">Please login to view your tickets</p>
        <RouterLink :to="{ name: 'login' }" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
          Login
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p class="text-gray-300">Loading your tickets...</p>
      </div>

      <!-- Tickets Grid -->
      <div v-else-if="bookings.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="booking in bookings" :key="booking._id"
               @click="openTicketDetails(booking)"
               class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group">
            
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-slate-800 to-slate-700 p-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
              <div class="relative">
                <div class="text-xs text-slate-400 mb-1">{{ booking.match?.round || booking.matchDetails?.round }}</div>
                <div class="text-lg font-bold text-white mb-1 line-clamp-2">
                  {{ getTeamName(booking, 'home') }} <span class="text-emerald-400 text-sm">vs</span> {{ getTeamName(booking, 'away') }}
                </div>
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                        :class="statusClass(booking.status)">
                    {{ booking.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-4 space-y-3">
              <!-- Date & Venue -->
              <div class="flex items-start gap-2 text-sm">
                <svg class="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <div class="text-slate-300">
                  <div>{{ formatDateShort(booking.matchDetails?.date) }}</div>
                  <div class="text-xs text-slate-400">{{ booking.matchDetails?.venue || 'Venue TBA' }}</div>
                </div>
              </div>

              <!-- Quick Info Grid -->
              <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50">
                <div class="text-center">
                  <div class="text-xs text-slate-400">Section</div>
                  <div class="text-sm font-semibold text-white truncate">{{ booking.section }}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-slate-400">Tickets</div>
                  <div class="text-sm font-semibold text-white">{{ booking.quantity }}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-slate-400">Amount</div>
                  <div class="text-sm font-semibold text-emerald-400">₹{{ formatNumber(booking.totalAmount) }}</div>
                </div>
              </div>

              <!-- View Details Button -->
              <div class="pt-2">
                <div class="text-center text-sm text-emerald-400 group-hover:text-emerald-300 flex items-center justify-center gap-1">
                  <span>View Details</span>
                  <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Tickets -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">No tickets yet</h3>
        <p class="text-slate-400 mb-6">You haven't booked any tickets</p>
        <RouterLink :to="{ name: 'ticket-booking' }" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
          Browse Available Matches
        </RouterLink>
      </div>
    </div>

    <!-- Ticket Details Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedBooking" 
             @click="closeTicketDetails"
             class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div @click.stop 
               class="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
            
            <!-- Modal Header -->
            <div class="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 z-10">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="text-sm text-emerald-100 mb-1">{{ selectedBooking.match?.round || selectedBooking.matchDetails?.round }}</div>
                  <div class="text-2xl font-bold text-white mb-2 flex items-center gap-2 flex-wrap">
                    <span>{{ getTeamName(selectedBooking, 'home') }}</span>
                    <span class="text-emerald-200 text-lg">VS</span>
                    <span>{{ getTeamName(selectedBooking, 'away') }}</span>
                  </div>
                  <div class="text-emerald-100 text-sm">
                    {{ formatDate(selectedBooking.matchDetails?.date) }}
                  </div>
                  <div class="text-emerald-100 text-sm">
                    📍 {{ selectedBooking.matchDetails?.venue }}
                  </div>
                </div>
                <button @click="closeTicketDetails" 
                        class="ml-4 p-2 hover:bg-white/20 rounded-lg transition">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="mt-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                      :class="statusClass(selectedBooking.status)">
                  {{ selectedBooking.status }}
                </span>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-6">
              <!-- Booking Details Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div class="text-xs text-slate-400 mb-1">Booking Code</div>
                  <div class="text-lg font-mono font-bold text-emerald-400">{{ selectedBooking.bookingCode }}</div>
                </div>
                <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div class="text-xs text-slate-400 mb-1">Section</div>
                  <div class="text-lg font-semibold text-white">{{ selectedBooking.section }}</div>
                </div>
                <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div class="text-xs text-slate-400 mb-1">Tickets</div>
                  <div class="text-lg font-semibold text-white">{{ selectedBooking.quantity }}</div>
                </div>
                <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div class="text-xs text-slate-400 mb-1">Total Paid</div>
                  <div class="text-lg font-bold text-emerald-400">₹{{ formatNumber(selectedBooking.totalAmount) }}</div>
                </div>
              </div>

              <!-- QR Code Section -->
              <div class="bg-slate-700/30 rounded-xl p-6 text-center">
                <h4 class="text-lg font-semibold text-white mb-4">🎫 Entry Pass</h4>
                <div v-if="selectedBooking.qrCodeData" class="inline-block bg-white p-4 rounded-xl mb-4 shadow-lg">
                  <img :src="selectedBooking.qrCodeData" alt="QR Code" class="w-48 h-48" />
                  <div class="mt-2 text-sm text-gray-600 font-mono">{{ selectedBooking.bookingCode }}</div>
                </div>
                <div v-else class="inline-block bg-white p-4 rounded-xl mb-4">
                  <div class="w-48 h-48 flex items-center justify-center bg-gray-100">
                    <span class="text-5xl">📱</span>
                  </div>
                  <div class="mt-2 text-sm text-gray-600 font-mono">{{ selectedBooking.bookingCode }}</div>
                </div>
                <p class="text-sm text-slate-400">Show this code at the venue entrance</p>
              </div>

              <!-- Individual Tickets -->
              <div v-if="selectedBooking.tickets?.length" class="bg-slate-700/30 rounded-xl p-6">
                <h4 class="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Ticket Numbers
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span v-for="ticket in selectedBooking.tickets" :key="ticket.ticketNumber"
                        class="px-3 py-2 bg-slate-700/70 text-slate-200 rounded-lg text-sm font-mono border border-slate-600/50">
                    {{ ticket.ticketNumber }}
                  </span>
                </div>
              </div>

              <!-- Booking Info -->
              <div class="bg-slate-700/30 rounded-xl p-6">
                <h4 class="text-sm font-semibold text-slate-300 mb-3">Booking Information</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Booked On:</span>
                    <span class="text-slate-200">{{ formatDateTime(selectedBooking.bookedAt) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Payment Status:</span>
                    <span class="text-emerald-400 font-semibold">{{ selectedBooking.paymentStatus }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Tournament:</span>
                    <span class="text-slate-200">{{ selectedBooking.tournament?.name || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const auth = useAuthStore();
const loading = ref(true);
const bookings = ref([]);
const selectedBooking = ref(null);

const isLoggedIn = computed(() => !!auth.user);

function formatDate(date) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatDateShort(date) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-IN');
}

function statusClass(status) {
  const classes = {
    'confirmed': 'bg-green-500/20 text-green-400 border border-green-500/30',
    'pending': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    'cancelled': 'bg-red-500/20 text-red-400 border border-red-500/30',
    'used': 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
  };
  return classes[status] || classes.pending;
}

// Helper to get team name from live match data or snapshot
function getTeamName(booking, type) {
  // 1. Try to get from live match data (most up-to-date)
  if (booking.match && typeof booking.match === 'object') {
    if (type === 'home' && (booking.match.homeClub?.name || booking.match.homeClub?.clubName)) 
      return booking.match.homeClub.name || booking.match.homeClub.clubName;
    if (type === 'away' && (booking.match.awayClub?.name || booking.match.awayClub?.clubName)) 
      return booking.match.awayClub.name || booking.match.awayClub.clubName;
    
    // If live match data exists but teams are not set, use smart placeholder
    if (booking.match.stage === 'knockout' || booking.match.round) {
      return getPlaceholderTeamName(booking.match, type);
    }
  }

  // 2. Fallback to snapshot data stored at booking time
  const snapshotName = type === 'home' ? booking.matchDetails?.homeClub : booking.matchDetails?.awayClub;
  if (snapshotName && snapshotName !== 'TBA' && snapshotName !== 'To Be Determined') {
    return snapshotName;
  }

  return 'To Be Determined';
}

function getPlaceholderTeamName(match, type) {
  const roundName = match.round || match.matchDetails?.round || 'Knockout Match';
  
  if (roundName.toLowerCase().includes('semi')) {
    return type === 'home' ? 'Winner of QF 1' : 'Winner of QF 2'; 
  }
  if (roundName.toLowerCase().includes('final') && !roundName.toLowerCase().includes('semi')) {
    return type === 'home' ? 'Winner of SF 1' : 'Winner of SF 2';
  }
  if (roundName.toLowerCase().includes('quarter')) {
    return type === 'home' ? 'Group A Winner' : 'Group B Runner-up';
  }
  return 'To Be Determined';
}

function openTicketDetails(booking) {
  selectedBooking.value = booking;
  document.body.style.overflow = 'hidden';
}

function closeTicketDetails() {
  selectedBooking.value = null;
  document.body.style.overflow = '';
}

async function fetchBookings() {
  if (!auth.user) {
    loading.value = false;
    return;
  }

  try {
    const res = await axios.get(`${API_BASE}/tickets/my-bookings`);
    bookings.value = res.data;
    console.log('Fetched bookings:', bookings.value);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    if (error.response?.status === 401) {
      console.error('Authentication failed - user may need to log in again');
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchBookings();
});
</script>

<style scoped>
/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}

/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.7);
}
</style>
