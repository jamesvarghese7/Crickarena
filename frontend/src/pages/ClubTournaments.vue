<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold text-sky-700 mb-4">Tournaments</h1>

      <div class="flex gap-2 mb-6">
        <button @click="activeTab = 'available'" class="px-3 py-1.5 rounded border text-sm" :class="activeTab==='available' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 hover:bg-gray-50'">Available</button>
        <button @click="activeTab = 'mine'" class="px-3 py-1.5 rounded border text-sm" :class="activeTab==='mine' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 hover:bg-gray-50'">My Tournaments</button>
      </div>

      <div v-if="activeTab==='available'">
        <div v-if="loadingA" class="text-gray-500">Loading...</div>
        <div v-else class="grid md:grid-cols-2 gap-4">
          <div v-for="t in available" :key="t._id" class="bg-white rounded-lg shadow border overflow-hidden">
            <img v-if="t.bannerUrl" :src="t.bannerUrl" class="w-full h-36 object-cover" />
            <div class="p-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-lg font-semibold text-gray-800">{{ t.name }}</div>
                  <div class="text-xs text-gray-500">{{ t.format }} • {{ fmtDate(t.startDate) }} - {{ fmtDate(t.endDate) }}</div>
                  <div class="text-xs text-gray-500">District: {{ t.district || '-' }}</div>
                  <div class="text-xs text-gray-500">Reg. Deadline: {{ t.registrationDeadline ? fmtDate(t.registrationDeadline) : '-' }}</div>
                </div>
              </div>
              <div class="mt-3">
                <label class="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" v-model="agree[t._id]" />
                  <span>I agree to tournament rules</span>
                </label>
              </div>
              <div class="mt-3">
                <template v-if="eligibility(t).canRegister">
                  <button @click="register(t)" class="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">Register Now</button>
                </template>
                <template v-else>
                  <span class="px-2 py-0.5 text-xs rounded border" :class="eligibility(t).badgeClass">{{ eligibility(t).reason }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="loadingM" class="text-gray-500">Loading...</div>
        <div v-else class="grid md:grid-cols-2 gap-4">
          <div v-for="t in mine" :key="t._id" class="bg-white rounded-lg shadow border overflow-hidden">
            <img v-if="t.bannerUrl" :src="t.bannerUrl" class="w-full h-36 object-cover" />
            <div class="p-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-lg font-semibold text-gray-800">{{ t.name }}</div>
                  <div class="text-xs text-gray-500">{{ t.format }} • {{ fmtDate(t.startDate) }} - {{ fmtDate(t.endDate) }}</div>
                  <div class="text-xs text-gray-500">District: {{ t.district || '-' }}</div>
                </div>
                <span class="px-2 py-0.5 text-xs rounded border" :class="statusClass(t.myRegistrationStatus)">{{ t.myRegistrationStatus }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '../utils/api';

const activeTab = ref('available');
const available = ref([]);
const mine = ref([]);
const loadingA = ref(false);
const loadingM = ref(false);
const agree = ref({});

function fmtDate(d){ return new Date(d).toLocaleDateString(); }
function statusClass(status){
  return status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
         status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
         status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
         'bg-gray-50 text-gray-700 border-gray-200';
}

// Map of tournamentId -> my status for quick checks
const myStatusMap = computed(() => {
  const map = {};
  for (const t of mine.value) map[t._id] = t.myRegistrationStatus;
  return map;
});

function eligibility(t){
  const now = new Date();
  const regDeadlinePassed = t.registrationDeadline && new Date(t.registrationDeadline) < now;
  const notOpen = t.status !== 'open';
  const myStatus = myStatusMap.value[t._id];
  const regs = Array.isArray(t.registrations) ? t.registrations : [];
  const approvedCount = regs.filter(r => r.status === 'approved' || r.status === 'pending').length; // pending also occupies a slot
  const isFull = typeof t.maxTeams === 'number' && approvedCount >= t.maxTeams;

  if (myStatus === 'approved') return { canRegister: false, reason: 'Approved', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (myStatus === 'pending') return { canRegister: false, reason: 'Pending Approval', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  if (myStatus === 'rejected') return { canRegister: false, reason: 'Rejected', badgeClass: 'bg-red-50 text-red-700 border-red-200' };
  if (regDeadlinePassed) return { canRegister: false, reason: 'Registration Closed', badgeClass: 'bg-gray-50 text-gray-700 border-gray-200' };
  if (isFull) return { canRegister: false, reason: 'Full', badgeClass: 'bg-gray-50 text-gray-700 border-gray-200' };
  if (notOpen) return { canRegister: false, reason: 'Not Available', badgeClass: 'bg-gray-50 text-gray-700 border-gray-200' };
  // Backend also ensures club approved; we assume club-manager route implies approved club, but UI hint:
  // Optionally fetch club status and add check here if needed.
  return { canRegister: true, reason: 'Register Now', badgeClass: 'bg-green-50 text-green-700 border-green-200' };
}

async function loadAvailable(){
  loadingA.value = true; try { const { data } = await api.get('/tournaments/open'); available.value = data; } finally { loadingA.value = false; }
}
async function loadMine(){
  loadingM.value = true; try { const { data } = await api.get('/tournaments/mine'); mine.value = data; } finally { loadingM.value = false; }
}

async function register(t){
  if (!agree.value[t._id]){ alert('Please agree to tournament rules'); return; }
  const elig = eligibility(t);
  if (!elig.canRegister){ alert(elig.reason); return; }
  try {
    await api.post(`/tournaments/${t._id}/register`);
    alert('Registration submitted');
  } catch (e) {
    alert(e?.response?.data?.error || e?.response?.data?.message || e.message || 'Failed to register');
  }
  await Promise.all([loadAvailable(), loadMine()]);
}

onMounted(async () => { await Promise.all([loadAvailable(), loadMine()]); });
watch(activeTab, async () => { if (activeTab.value==='available') loadAvailable(); else loadMine(); });
</script>