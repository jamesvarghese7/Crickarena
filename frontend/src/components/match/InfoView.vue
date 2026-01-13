<template>
  <div class="space-y-6">
    <!-- Match Info -->
    <div class="bg-gradient-to-br from-slate-800/80 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-xl">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Match Info</h3>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Match</div>
          <div class="font-semibold text-white">{{ match.matchCode || `Match #${match._id?.slice(-6)}` }}</div>
        </div>
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Tournament</div>
          <div class="font-semibold text-white">{{ match.tournament?.name || match.tournament?.title || 'Tournament' }}</div>
        </div>
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Stage</div>
          <div class="font-semibold text-white">{{ match.stage || match.round || 'League' }}</div>
        </div>
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Format</div>
          <div class="font-semibold text-white">{{ match.matchFormat || 'T20' }} ({{ match.oversLimit || 20 }} overs)</div>
        </div>
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 md:col-span-2">
          <div class="text-xs text-slate-500 mb-1">Status</div>
          <div class="font-semibold" :class="statusClass">{{ match.status }}</div>
        </div>
      </div>
    </div>

    <!-- Venue -->
    <div class="bg-gradient-to-br from-slate-800/80 to-emerald-900/20 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 shadow-xl">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Venue</h3>
      </div>
      <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
        <div class="text-lg font-semibold text-white">{{ match.venue || 'Venue to be announced' }}</div>
      </div>
    </div>

    <!-- Schedule -->
    <div class="bg-gradient-to-br from-slate-800/80 to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">Schedule</h3>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Date</div>
          <div class="font-semibold text-white">{{ formatDate(match.date) }}</div>
        </div>
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Time</div>
          <div class="font-semibold text-white">{{ formatTime(match.time) }}</div>
        </div>
      </div>
    </div>

    <!-- Toss -->
    <div v-if="match.toss?.wonBy" class="bg-gradient-to-br from-slate-800/80 to-amber-900/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 shadow-xl">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <span class="text-white text-lg">🪙</span>
        </div>
        <h3 class="text-lg font-bold text-white">Toss</h3>
      </div>
      <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 text-center">
        <div class="text-lg font-bold text-white">{{ getTossWinner() }}</div>
        <div class="text-slate-400 mt-1">won the toss and elected to <strong class="text-emerald-400">{{ match.toss.decision?.toUpperCase() || 'BAT' }}</strong></div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="match.status === 'Completed' && match.result" class="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30 shadow-xl">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span class="text-white text-lg">🏆</span>
        </div>
        <h3 class="text-lg font-bold text-white">Result</h3>
      </div>
      <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
        <div class="text-2xl font-black text-emerald-400 mb-2">{{ getWinnerName() }}</div>
        <div class="text-slate-300">{{ getResultMargin() }}</div>
      </div>
    </div>

    <!-- Match Summary -->
    <div v-if="hasSummary" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
      <h3 class="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <span>📝</span> Match Summary
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div v-if="match.summary?.topScorer" class="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Top Scorer</div>
          <div class="font-semibold text-white">{{ match.summary.topScorer }}</div>
        </div>
        <div v-if="match.summary?.topWicketTaker" class="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div class="text-xs text-slate-500 mb-1">Top Wicket Taker</div>
          <div class="font-semibold text-white">{{ match.summary.topWicketTaker }}</div>
        </div>
        <div v-if="match.summary?.playerOfTheMatch" class="p-5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border-l-4 border-amber-500 md:col-span-2">
          <div class="text-xs text-amber-400 mb-1">🏆 Player of the Match</div>
          <div class="font-bold text-white text-lg">{{ match.summary.playerOfTheMatch }}</div>
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
  'text-red-400': props.match.status === 'Live',
  'text-emerald-400': props.match.status === 'Completed',
  'text-amber-400': props.match.status === 'Scheduled',
  'text-red-500': props.match.status === 'Cancelled'
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
