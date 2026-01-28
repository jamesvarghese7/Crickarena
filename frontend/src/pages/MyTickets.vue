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

      <!-- Tickets List -->
      <div v-else-if="bookings.length > 0" class="space-y-6">
        <div v-for="booking in bookings" :key="booking._id"
             class="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <!-- Ticket Header -->
          <div class="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="text-sm text-slate-400 mb-1">{{ booking.matchDetails?.round }}</div>
                <div class="text-xl font-bold text-white">
                  {{ booking.matchDetails?.homeClub }} vs {{ booking.matchDetails?.awayClub }}
                </div>
                <div class="text-slate-400 mt-1">
                  {{ formatDate(booking.matchDetails?.date) }} • {{ booking.matchDetails?.venue }}
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                      :class="statusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Ticket Details -->
          <div class="p-6">
            <div class="grid md:grid-cols-4 gap-6 mb-6">
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <div class="text-sm text-slate-400">Booking Code</div>
                <div class="text-xl font-mono font-bold text-emerald-400">{{ booking.bookingCode }}</div>
              </div>
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <div class="text-sm text-slate-400">Section</div>
                <div class="text-xl font-semibold text-white">{{ booking.section }}</div>
              </div>
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <div class="text-sm text-slate-400">Tickets</div>
                <div class="text-xl font-semibold text-white">{{ booking.quantity }}</div>
              </div>
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <div class="text-sm text-slate-400">Total Paid</div>
                <div class="text-xl font-bold text-emerald-400">₹{{ formatNumber(booking.totalAmount) }}</div>
              </div>
            </div>

            <!-- QR Code Section -->
            <div class="bg-slate-700/30 rounded-xl p-6 text-center">
              <h4 class="text-lg font-semibold text-white mb-4">Entry Pass</h4>
              <div class="inline-block bg-white p-4 rounded-xl mb-4">
                <!-- QR Code placeholder - in production, generate actual QR -->
                <div class="w-40 h-40 flex items-center justify-center bg-gray-100">
                  <span class="text-4xl">📱</span>
                </div>
                <div class="mt-2 text-sm text-gray-600 font-mono">{{ booking.bookingCode }}</div>
              </div>
              <p class="text-sm text-slate-400">Show this code at the venue entrance</p>
            </div>

            <!-- Individual Tickets -->
            <div v-if="booking.tickets?.length" class="mt-6">
              <h4 class="text-sm font-semibold text-slate-400 mb-3">Ticket Numbers</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="ticket in booking.tickets" :key="ticket.ticketNumber"
                      class="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-mono">
                  {{ ticket.ticketNumber }}
                </span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const auth = useAuthStore();
const loading = ref(true);
const bookings = ref([]);

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

async function fetchBookings() {
  if (!auth.user) {
    loading.value = false;
    return;
  }

  try {
    const token = localStorage.getItem('firebaseToken');
    const res = await fetch(`${API_BASE}/tickets/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      bookings.value = await res.json();
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchBookings();
});
</script>  
