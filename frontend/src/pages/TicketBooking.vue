<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
    <!-- Hero Header -->
    <div class="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-12">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-white mb-4">🎟️ Match Tickets</h1>
          <p class="text-xl text-emerald-100">Book tickets for exciting knockout matches</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p class="text-gray-300">Loading available matches...</p>
      </div>

      <!-- Match List -->
      <div v-else-if="matches.length > 0" class="space-y-6">
        <!-- My Tickets Link -->
        <div v-if="isLoggedIn" class="flex justify-end">
          <RouterLink :to="{ name: 'my-tickets' }" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            My Tickets
          </RouterLink>
        </div>

        <!-- Match Cards -->
        <div v-for="inv in matches" :key="inv._id" 
             class="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition">
          <!-- Match Header -->
          <div class="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <!-- Teams -->
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                    <img v-if="inv.match?.homeClub?.logoUrl" :src="inv.match.homeClub.logoUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-white font-bold">{{ inv.match?.homeClub?.shortName?.charAt(0) || '?' }}</span>
                  </div>
                  <span class="font-semibold" :class="inv.match?.homeClub ? 'text-white' : 'text-slate-400 italic'">
                    {{ inv.match?.homeClub?.name || inv.match?.homeClub?.clubName || getPlaceholderTeamName(inv.match, 'home') }}
                  </span>
                </div>
                <span class="text-emerald-400 font-bold text-lg">VS</span>
                <div class="flex items-center gap-3">
                  <span class="font-semibold" :class="inv.match?.awayClub ? 'text-white' : 'text-slate-400 italic'">
                    {{ inv.match?.awayClub?.name || inv.match?.awayClub?.clubName || getPlaceholderTeamName(inv.match, 'away') }}
                  </span>
                  <div class="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                    <img v-if="inv.match?.awayClub?.logoUrl" :src="inv.match.awayClub.logoUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-white font-bold">{{ inv.match?.awayClub?.shortName?.charAt(0) || '?' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Meta -->
              <div class="flex flex-wrap items-center gap-3">
                <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                  {{ inv.matchDetails?.round || inv.matchDetails?.stage }}
                </span>
                <span class="text-slate-400">{{ formatDate(inv.matchDetails?.date) }}</span>
                <span class="text-slate-400">• {{ inv.venue }}</span>
              </div>
            </div>
          </div>

          <!-- Ticket Sections -->
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-semibold text-white mb-4">Select Tickets</h3>
            
            <div class="grid md:grid-cols-3 gap-4">
              <div v-for="section in inv.sections" :key="section.name"
                   class="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-emerald-500 transition cursor-pointer"
                   :class="{ 'ring-2 ring-emerald-500': selectedSection === `${inv._id}-${section.name}` }"
                   @click="selectSection(inv, section)">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-white">{{ section.name }}</span>
                  <span class="text-emerald-400 font-bold">₹{{ formatNumber(section.price) }}</span>
                </div>
                <div class="text-sm text-slate-400">
                  {{ section.capacity - section.booked }} seats available
                </div>
                <div class="mt-2 w-full bg-slate-600 rounded-full h-2">
                  <div class="bg-emerald-500 rounded-full h-2" 
                       :style="{ width: ((section.capacity - section.booked) / section.capacity * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Matches -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">No tickets available</h3>
        <p class="text-slate-400">Check back later for knockout match tickets</p>
      </div>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Book Tickets</h3>
            <button @click="closeModal" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <!-- Section Info -->
          <div class="bg-slate-700/50 rounded-lg p-4">
            <div class="text-sm text-slate-400">Section</div>
            <div class="text-lg font-semibold text-white">{{ bookingData.section }}</div>
            <div class="text-emerald-400 font-bold">₹{{ formatNumber(bookingData.price) }} per ticket</div>
          </div>

          <!-- Quantity -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Number of Tickets</label>
            <select v-model="bookingData.quantity" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white">
              <option v-for="n in Math.min(10, bookingData.available)" :key="n" :value="n">{{ n }} ticket{{ n > 1 ? 's' : '' }}</option>
            </select>
          </div>

          <!-- User Details -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input v-model="bookingData.name" type="text" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white" placeholder="Enter your name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input v-model="bookingData.email" type="email" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white" placeholder="Enter your email" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Phone</label>
            <input 
              v-model="bookingData.phone" 
              type="tel" 
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white" 
              placeholder="Enter your phone"
              maxlength="10"
              @input="bookingData.phone = bookingData.phone.replace(/\D/g, '').slice(0, 10)"
            />
            <p v-if="bookingData.phone && bookingData.phone.length !== 10" class="text-red-400 text-xs mt-1">
              Phone number must be exactly 10 digits
            </p>
          </div>

          <!-- Total -->
          <div class="bg-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
            <span class="text-slate-300">Total Amount</span>
            <span class="text-2xl font-bold text-emerald-400">₹{{ formatNumber(bookingData.price * bookingData.quantity) }}</span>
          </div>

          <!-- Pay Button -->
          <button @click="initiatePayment" 
                  :disabled="!isFormValid || processing"
                  class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ processing ? 'Processing...' : 'Pay Now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
        <p class="text-slate-400 mb-4">Your tickets have been booked successfully.</p>
        <div class="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div class="text-sm text-slate-400">Booking Code</div>
          <div class="text-2xl font-mono font-bold text-emerald-400">{{ confirmedBooking?.bookingCode }}</div>
        </div>
        <div class="flex gap-3">
          <button @click="showSuccessModal = false; refreshData()" class="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            Close
          </button>
          <RouterLink :to="{ name: 'my-tickets' }" class="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-center">
            View Tickets
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(true);
const matches = ref([]);
const showBookingModal = ref(false);
const showSuccessModal = ref(false);
const processing = ref(false);
const selectedSection = ref(null);
const confirmedBooking = ref(null);

const bookingData = ref({
  matchId: null,
  inventoryId: null,
  section: '',
  price: 0,
  quantity: 1,
  available: 0,
  name: '',
  email: '',
  phone: ''
});

const isLoggedIn = computed(() => !!auth.user);

const isFormValid = computed(() => {
  return bookingData.value.name && 
         bookingData.value.email && 
         bookingData.value.phone &&
         bookingData.value.phone.length === 10 && // Validate phone length
         bookingData.value.quantity > 0;
});

function formatDate(date) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-IN', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getPlaceholderTeamName(match, type) {
  if (!match) return 'TBA';
  
  // If team exists, return its name (though this function usually called when it doesn't)
  if (type === 'home' && match.homeClub) return match.homeClub.name || match.homeClub.clubName;
  if (type === 'away' && match.awayClub) return match.awayClub.name || match.awayClub.clubName;

  // For knockout matches without seeded teams
  if (match.stage === 'knockout' || match.round) {
    const roundName = match.round || 'Knockout Match';
    
    // Semis
    if (roundName.toLowerCase().includes('semi')) {
      return type === 'home' ? 'Winner of QF 1' : 'Winner of QF 2'; 
    }
    // Final
    if (roundName.toLowerCase().includes('final') && !roundName.toLowerCase().includes('semi') && !roundName.toLowerCase().includes('quarter')) {
      return type === 'home' ? 'Winner of SF 1' : 'Winner of SF 2';
    }
    // Quarter Finals
    if (roundName.toLowerCase().includes('quarter')) {
      return type === 'home' ? 'Group A Winner' : 'Group B Runner-up'; // Generic placeholder
    }
  }

  return 'To Be Determined';
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-IN');
}

async function refreshData() {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/tickets/available`);
    if (res.ok) {
      matches.value = await res.json();
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
  } finally {
    loading.value = false;
  }
}

function selectSection(inventory, section) {
  const available = section.capacity - section.booked;
  if (available <= 0) {
    alert('This section is sold out');
    return;
  }

  selectedSection.value = `${inventory._id}-${section.name}`;
  bookingData.value = {
    matchId: inventory.match._id,
    inventoryId: inventory._id,
    section: section.name,
    price: section.price,
    quantity: 1,
    available,
    name: auth.userProfile?.name || '',
    email: auth.user?.email || '',
    phone: ''
  };
  showBookingModal.value = true;
}

function closeModal() {
  showBookingModal.value = false;
  selectedSection.value = null;
}

async function initiatePayment() {
  if (!isFormValid.value) return;

  processing.value = true;
  try {
    // Create booking order
    const res = await axios.post(`${API_BASE}/tickets/book`, {
      matchId: bookingData.value.matchId,
      section: bookingData.value.section,
      quantity: bookingData.value.quantity,
      user: {
        name: bookingData.value.name,
        email: bookingData.value.email,
        phone: bookingData.value.phone
      }
    });

    const data = res.data;

    // Initialize Razorpay
    const options = {
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: 'CrickArena',
      description: `Ticket: ${bookingData.value.section} x ${bookingData.value.quantity}`,
      order_id: data.order.id,
      handler: async function(response) {
        await verifyPayment(response, data.booking.bookingCode);
      },
      prefill: {
        name: bookingData.value.name,
        email: bookingData.value.email,
        contact: bookingData.value.phone
      },
      theme: {
        color: '#10b981'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  } finally {
    processing.value = false;
  }
}

async function verifyPayment(response, bookingCode) {
  try {
    const res = await axios.post(`${API_BASE}/tickets/verify`, {
      bookingCode,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    });

    confirmedBooking.value = res.data.booking;
    showBookingModal.value = false;
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Verification error:', error);
    const message = error.response?.data?.message || 'Payment verification failed';
    alert(message);
  }
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
