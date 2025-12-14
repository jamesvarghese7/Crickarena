<template>
  <div class="space-y-6">
    <!-- Match Info -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Match Info</h3>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-xs text-gray-500 mb-1">Match</div>
          <div class="font-semibold text-gray-900">{{ match.matchCode || `Match #${match._id?.slice(-6)}` }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-xs text-gray-500 mb-1">Tournament</div>
          <div class="font-semibold text-gray-900">{{ match.tournament?.name || match.tournament?.title || 'Tournament' }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-xs text-gray-500 mb-1">Stage</div>
          <div class="font-semibold text-gray-900">{{ match.stage || match.round || 'League' }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-xs text-gray-500 mb-1">Format</div>
          <div class="font-semibold text-gray-900">{{ match.matchFormat || 'T20' }} ({{ match.oversLimit || 20 }} overs)</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 md:col-span-2">
          <div class="text-xs text-gray-500 mb-1">Status</div>
          <div class="font-semibold" :class="statusClass">{{ match.status }}</div>
        </div>
      </div>
    </div>

    <!-- Venue -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Venue</h3>
      </div>
      <div class="bg-white rounded-xl p-4 border border-gray-200">
        <div class="text-lg font-semibold text-gray-900">{{ match.venue || 'Venue to be announced' }}</div>
      </div>
    </div>

    <!-- Schedule -->
    <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Schedule</h3>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-xs text-gray-500 mb-1">Date</div>
          <div class="font-semibold text-gray-900">{{ formatDate(match.date) }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-xs text-gray-500 mb-1">Time</div>
          <div class="font-semibold text-gray-900">{{ formatTime(match.time) }}</div>
        </div>
      </div>
    </div>

    <!-- Toss -->
    <div v-if="match.toss?.wonBy" class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <span class="text-white text-lg">🪙</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Toss</h3>
      </div>
      <div class="bg-white rounded-xl p-4 border border-gray-200 text-center">
        <div class="text-lg font-bold text-gray-900">{{ getTossWinner() }}</div>
        <div class="text-gray-600">won the toss and elected to <strong class="text-emerald-600">{{ match.toss.decision?.toUpperCase() || 'BAT' }}</strong></div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="match.status === 'Completed' && match.result" class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <span class="text-white text-lg">🏆</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Result</h3>
      </div>
      <div class="bg-white rounded-xl p-6 border border-gray-200 text-center">
        <div class="text-2xl font-bold text-emerald-600 mb-2">{{ getWinnerName() }}</div>
        <div class="text-gray-600">{{ getResultMargin() }}</div>
      </div>
    </div>

    <!-- Match Summary -->
    <div v-if="hasSummary" class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Match Summary</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div v-if="match.summary?.topScorer" class="p-4 bg-gray-50 rounded-xl">
          <div class="text-xs text-gray-500 mb-1">Top Scorer</div>
          <div class="font-semibold text-gray-900">{{ match.summary.topScorer }}</div>
        </div>
        <div v-if="match.summary?.topWicketTaker" class="p-4 bg-gray-50 rounded-xl">
          <div class="text-xs text-gray-500 mb-1">Top Wicket Taker</div>
          <div class="font-semibold text-gray-900">{{ match.summary.topWicketTaker }}</div>
        </div>
        <div v-if="match.summary?.playerOfTheMatch" class="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400 md:col-span-2">
          <div class="text-xs text-amber-600 mb-1">Player of the Match</div>
          <div class="font-bold text-gray-900">{{ match.summary.playerOfTheMatch }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true }
});

const statusClass = computed(() => ({
  'text-emerald-600': props.match.status === 'Live',
  'text-blue-600': props.match.status === 'Completed',
  'text-amber-600': props.match.status === 'Scheduled',
  'text-red-600': props.match.status === 'Cancelled'
}));

const hasSummary = computed(() => {
  const s = props.match.summary;
  return s && (s.topScorer || s.topWicketTaker || s.playerOfTheMatch);
});

function formatDate(dateString) {
  if (!dateString) return 'TBD';
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(timeString) {
  if (!timeString) return 'TBD';
  try {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch { return timeString; }
}

function getTossWinner() {
  const id = props.match.toss?.wonBy;
  if (String(id) === String(props.match.teams?.home?.id)) return props.match.teams?.home?.name;
  if (String(id) === String(props.match.teams?.away?.id)) return props.match.teams?.away?.name;
  return 'Unknown';
}

function getWinnerName() {
  const id = props.match.result?.winner;
  if (props.match.result?.isTie) return 'Match Tied';
  if (props.match.result?.isNoResult) return 'No Result';
  if (String(id) === String(props.match.teams?.home?.id)) return props.match.teams?.home?.name;
  if (String(id) === String(props.match.teams?.away?.id)) return props.match.teams?.away?.name;
  return 'Winner';
}

function getResultMargin() {
  const r = props.match.result;
  if (!r) return '';
  if (r.isTie) return 'Both teams finished with the same score';
  if (r.isNoResult) return r.summary || 'Match abandoned';
  if (r.margin?.runs) return `Won by ${r.margin.runs} runs`;
  if (r.margin?.wickets) return `Won by ${r.margin.wickets} wickets`;
  return r.summary || '';
}
</script>
