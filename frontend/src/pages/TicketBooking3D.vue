<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-900 relative">
    <!-- Fullscreen Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-slate-900 z-50">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-6"></div>
        <p class="text-xl text-gray-300">Loading 3D Stadium...</p>
        <p class="text-sm text-slate-500 mt-2">Preparing your immersive experience</p>
      </div>
    </div>

    <!-- Fullscreen Error State -->
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-slate-900 z-50">
      <div class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 max-w-lg text-center">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <p class="text-red-300 text-lg mb-4">{{ error }}</p>
        <button @click="fetchSeats" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
          Try Again
        </button>
      </div>
    </div>

    <!-- Fullscreen 3D Stadium Viewer -->
    <div v-else class="absolute inset-0">
      <Stadium3DViewer
        v-if="!loading"
        :model-code="stadiumConfig?.modelCode || 'small'"
        :seats="seats"
        :selected-seats="selectedSeatIds"
        :interactive="true"
        @seat-click="handleSeatClick"
        @seat-hover="handleSeatHover"
        @multi-select="handleMultiSelect"
      />
    </div>

    <!-- Floating Top Bar - Match Info -->
    <div v-if="!loading && !error" class="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      <!-- Back Button -->
      <RouterLink 
        to="/tickets" 
        class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg text-white hover:bg-slate-700/90 transition shadow-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="hidden sm:inline">Back</span>
      </RouterLink>
      
      <!-- Match Info Card -->
      <div class="pointer-events-auto bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-6 py-3 shadow-lg">
        <div class="flex items-center gap-4">
          <span class="font-bold text-white">{{ matchData?.homeTeam || 'TBA' }}</span>
          <span class="text-emerald-400 font-bold">VS</span>
          <span class="font-bold text-white">{{ matchData?.awayTeam || 'TBA' }}</span>
          <span class="hidden md:inline-block px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-xs">
            {{ matchData?.round || 'Knockout' }}
          </span>
          <span class="hidden lg:inline text-slate-400 text-sm">{{ formatDate(matchData?.date) }}</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="pointer-events-auto hidden md:flex items-center gap-3 px-4 py-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span class="text-xs text-slate-300">Available</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span class="text-xs text-slate-300">Selected</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          <span class="text-xs text-slate-300">Booked</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-slate-600"></span>
          <span class="text-xs text-slate-300">Locked</span>
        </div>
      </div>
    </div>

    <!-- Collapsible Right Sidebar -->
    <div v-if="!loading && !error" class="sidebar-container" :class="{ collapsed: !showPanel }">
      <!-- Toggle Arrow Button -->
      <button 
        @click="showPanel = !showPanel"
        class="sidebar-toggle"
        :title="showPanel ? 'Hide Panel' : 'Show Panel'"
      >
        <svg 
          class="w-5 h-5 transition-transform duration-300" 
          :class="{ 'rotate-180': !showPanel }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <!-- Badge showing count when collapsed -->
        <span v-if="!showPanel && selectedSeats.length > 0" class="sidebar-badge">
          {{ selectedSeats.length }}
        </span>
      </button>

      <!-- Panel Content -->
      <div class="sidebar-content">
        <!-- Capacity Stats -->
        <div class="sidebar-card">
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center p-2 bg-emerald-500/20 rounded-lg">
              <div class="text-xl font-bold text-emerald-400">{{ seatSummary?.available || 0 }}</div>
              <div class="text-xs text-slate-400">Available</div>
            </div>
            <div class="text-center p-2 bg-slate-700/50 rounded-lg">
              <div class="text-xl font-bold text-slate-300">{{ seatSummary?.total || 0 }}</div>
              <div class="text-xs text-slate-400">Total</div>
            </div>
          </div>
        </div>

        <!-- Selected Seats -->
        <div class="sidebar-card flex-1 overflow-hidden flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-white">Selected Seats</h3>
            <span class="text-xs px-2 py-1 bg-blue-500/30 text-blue-300 rounded-full">{{ selectedSeats.length }}/10</span>
          </div>

          <div v-if="selectedSeats.length === 0" class="flex-1 flex items-center justify-center text-slate-500">
            <div class="text-center">
              <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
              <p class="text-sm">Click seats to select</p>
            </div>
          </div>

          <div v-else class="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            <div 
              v-for="seat in selectedSeats" 
              :key="seat.seatId"
              class="flex items-center justify-between p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg"
            >
              <div>
                <div class="text-white text-sm font-medium">{{ seat.section }}</div>
                <div class="text-xs text-slate-400">Row {{ seat.row }}, Seat {{ seat.seatNumber }}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 font-semibold text-sm">₹{{ seat.price }}</span>
                <button 
                  @click="removeSeat(seat.seatId)"
                  class="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Summary & Button -->
        <div v-if="selectedSeats.length > 0" class="sidebar-card booking-summary">
          <div class="flex items-center justify-between mb-3">
            <span class="text-emerald-100">{{ selectedSeats.length }} seat{{ selectedSeats.length > 1 ? 's' : '' }}</span>
            <span class="text-2xl font-bold text-white">₹{{ totalAmount.toLocaleString() }}</span>
          </div>
          <button
            @click="showBookingModal = true"
            class="w-full py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Complete Booking</h3>
            <button @click="showBookingModal = false" class="text-white/80 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="initiateBooking" class="p-6 space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Full Name</label>
            <input 
              v-model="bookingForm.name" 
              type="text" 
              required 
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-1">Email</label>
            <input 
              v-model="bookingForm.email" 
              type="email" 
              required 
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-1">Phone</label>
            <input 
              v-model="bookingForm.phone" 
              type="tel" 
              required 
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>

          <!-- Selected Seats Summary -->
          <div class="bg-slate-700/50 rounded-lg p-4">
            <div class="text-sm text-slate-300 mb-2">Selected Seats:</div>
            <div class="text-white font-medium">
              {{ selectedSeats.map(s => `Row ${s.row} Seat ${s.seatNumber}`).join(', ') }}
            </div>
            <div class="mt-2 text-emerald-400 font-semibold">Total: ₹{{ totalAmount }}</div>
          </div>

          <button 
            type="submit" 
            :disabled="bookingLoading"
            class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            <span v-if="bookingLoading" class="flex items-center justify-center gap-2">
              <span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              Processing...
            </span>
            <span v-else>Pay ₹{{ totalAmount }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="bookingSuccess" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
        <p class="text-slate-400 mb-2">Booking Code: <span class="text-emerald-400 font-mono">{{ confirmedBooking?.bookingCode }}</span></p>
        <p class="text-slate-400 text-sm mb-6">A confirmation email has been sent with your QR code ticket.</p>
        
        <div class="flex gap-3">
          <RouterLink 
            to="/my-tickets" 
            class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
          >
            View My Tickets
          </RouterLink>
          <RouterLink 
            to="/tickets" 
            class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            Book More
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import Stadium3DViewer from '../components/Stadium3DViewer.vue';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const route = useRoute();
const authStore = useAuthStore();

// State
const loading = ref(true);
const error = ref(null);
const matchId = ref(route.params.matchId);

// Data from API
const matchData = ref(null);
const stadiumConfig = ref(null);
const seats = ref([]);
const seatSummary = ref(null);

// Selection state
const selectedSeats = ref([]);
const selectedSeatIds = computed(() => selectedSeats.value.map(s => s.seatId));

// UI state
const showPanel = ref(true);

// Booking state
const showBookingModal = ref(false);
const bookingLoading = ref(false);
const bookingSuccess = ref(false);
const confirmedBooking = ref(null);
const bookingForm = ref({
  name: authStore.user?.displayName || '',
  email: authStore.user?.email || '',
  phone: ''
});

// Computed
const totalAmount = computed(() => {
  return selectedSeats.value.reduce((sum, seat) => sum + seat.price, 0);
});

// Methods
async function fetchSeats() {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${API_BASE}/tickets/${matchId.value}/seats`);
    const data = response.data;

    matchData.value = {
      homeTeam: data.match?.homeClub?.name || data.match?.homeClub?.clubName || 'TBA',
      awayTeam: data.match?.awayClub?.name || data.match?.awayClub?.clubName || 'TBA',
      date: data.match?.date,
      venue: data.venue,
      round: data.match?.round || data.match?.stage
    };

    stadiumConfig.value = data.stadiumConfig;
    seats.value = data.seats;
    seatSummary.value = data.seatSummary;
  } catch (err) {
    console.error('Error fetching seats:', err);
    if (err.response?.status === 400 && err.response?.data?.bookingMode === 'classic') {
      // Redirect to classic booking
      window.location.href = `/tickets?matchId=${matchId.value}`;
      return;
    }
    error.value = err.response?.data?.message || 'Failed to load stadium data';
  } finally {
    loading.value = false;
  }
}

function handleSeatClick(seat) {
  if (selectedSeatIds.value.includes(seat.seatId)) {
    // Deselect
    selectedSeats.value = selectedSeats.value.filter(s => s.seatId !== seat.seatId);
  } else if (seat.status === 'available' && selectedSeats.value.length < 10) {
    // Select
    selectedSeats.value.push(seat);
  }
}

function handleSeatHover(seat) {
  // Could show additional info in a tooltip
}

function removeSeat(seatId) {
  selectedSeats.value = selectedSeats.value.filter(s => s.seatId !== seatId);
}

function handleMultiSelect(seats) {
  // Add multiple seats at once, respecting the 10 seat limit
  const remainingSlots = 10 - selectedSeats.value.length;
  const seatsToAdd = seats.slice(0, remainingSlots).filter(
    s => s.status === 'available' && !selectedSeatIds.value.includes(s.seatId)
  );
  selectedSeats.value.push(...seatsToAdd);
}

async function initiateBooking() {
  if (selectedSeats.value.length === 0) return;

  bookingLoading.value = true;

  try {
    // Hold seats and create Razorpay order
    const response = await axios.post(`${API_BASE}/tickets/${matchId.value}/seats/hold`, {
      seatIds: selectedSeatIds.value,
      user: {
        name: bookingForm.value.name,
        email: bookingForm.value.email,
        phone: bookingForm.value.phone
      }
    });

    const { keyId, order, booking } = response.data;

    // Initialize Razorpay
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'CrickArena',
      description: `${selectedSeats.value.length} Seat(s) - 3D Booking`,
      order_id: order.id,
      handler: async function(razorpayResponse) {
        await verifyPayment(booking.bookingCode, razorpayResponse);
      },
      prefill: {
        name: bookingForm.value.name,
        email: bookingForm.value.email,
        contact: bookingForm.value.phone
      },
      theme: {
        color: '#10b981'
      },
      modal: {
        ondismiss: async function() {
          // Release seats on payment modal close
          await releaseSeats(booking.bookingCode);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    showBookingModal.value = false;
  } catch (err) {
    console.error('Booking error:', err);
    alert(err.response?.data?.message || 'Failed to initiate booking');
  } finally {
    bookingLoading.value = false;
  }
}

async function verifyPayment(bookingCode, razorpayResponse) {
  try {
    const response = await axios.post(`${API_BASE}/tickets/verify-3d`, {
      bookingCode,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    });

    confirmedBooking.value = response.data.booking;
    bookingSuccess.value = true;
    selectedSeats.value = [];
    
    // Refresh seats to show updated availability
    await fetchSeats();
  } catch (err) {
    console.error('Payment verification failed:', err);
    alert('Payment verification failed. Please contact support.');
  }
}

async function releaseSeats(bookingCode) {
  try {
    await axios.post(`${API_BASE}/tickets/${matchId.value}/seats/release`, { bookingCode });
  } catch (err) {
    console.error('Failed to release seats:', err);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

onMounted(() => {
  fetchSeats();
});
</script>

<style scoped>
/* Collapsible Sidebar */
.sidebar-container {
  position: absolute;
  top: 80px;
  right: 0;
  bottom: 16px;
  width: 320px;
  z-index: 20;
  display: flex;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-container.collapsed {
  transform: translateX(280px);
}

.sidebar-toggle {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(51, 65, 85, 0.6);
  border-right: none;
  border-radius: 0.75rem 0 0 0.75rem;
  color: #94a3b8;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  color: white;
}

.sidebar-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #10b981;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 9999px;
  padding: 0 4px;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  padding-left: 0;
  overflow: hidden;
}

.sidebar-card {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.booking-summary {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(13, 148, 136, 0.95) 100%);
  border-color: rgba(16, 185, 129, 0.3);
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(71, 85, 105, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-container {
    width: 280px;
  }
  
  .sidebar-container.collapsed {
    transform: translateX(240px);
  }
}
</style>
