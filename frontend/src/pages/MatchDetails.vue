<template>
  <div class="min-h-screen bg-slate-900 flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
        <p class="text-slate-400 font-medium">Loading match...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">Error Loading Match</h3>
        <p class="text-slate-400 mb-6">{{ error }}</p>
        <button @click="loadMatch" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors">
          Try Again
        </button>
      </div>
    </div>

    <!-- Match Content -->
    <div v-else-if="match" class="flex-1 w-full flex flex-col">
      <!-- Hero Section -->
      <div class="relative overflow-hidden">
        <!-- Premium Background with Glow Effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-900/80 to-purple-900/30"></div>
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="absolute inset-0 opacity-5" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        
        <div class="relative px-4 sm:px-6 lg:px-8 py-8">
          <div class="max-w-5xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
              <button @click="goBack" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span class="font-medium">Back</span>
              </button>
              
              <div class="flex items-center gap-3">
                <span v-if="match.status === 'Live'" class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/30">
                  <span class="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  LIVE
                </span>
                <span v-else-if="match.status === 'Completed'" class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {{ match.status }}
                </span>
                <span v-else class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">
                  {{ match.status }}
                </span>
                <button @click="loadMatch" :disabled="loading" class="p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-all border border-slate-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Tournament & Match Info -->
            <div class="text-center mb-6">
              <h1 class="text-2xl font-bold text-white mb-3 tracking-tight">{{ tournamentName }}</h1>
              <div class="flex items-center justify-center flex-wrap gap-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {{ match.matchFormat || 'T20' }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                  {{ match.round || match.stage || 'Match' }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                  {{ formatDate(match.date) }}
                </span>
              </div>
            </div>

            <!-- Toss Info - Compact Display -->
            <div v-if="match.toss?.wonBy" class="flex justify-center mb-4">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-full text-xs text-slate-300 border border-slate-600/50">
                <span class="text-amber-400">🪙</span>
                <span><strong class="text-white">{{ getTossWinnerName() }}</strong> won toss, elected to <strong class="text-amber-400 uppercase">{{ match.toss.decision || 'bat' }}</strong></span>
              </div>
            </div>

            <!-- Teams & Score Card -->
            <div class="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
              <div class="flex items-center justify-between">
                <!-- Home Team -->
                <div class="flex-1 text-center">
                  <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-600 shadow-lg">
                    <img v-if="match.teams?.home?.logoUrl" :src="match.teams.home.logoUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-3xl font-bold text-amber-400">{{ match.teams?.home?.name?.charAt(0) }}</span>
                  </div>
                  <h3 class="font-bold text-white text-base mb-2">{{ match.teams?.home?.name }}</h3>
                  <div v-if="match.status !== 'Scheduled'" class="text-3xl font-black text-white tracking-tight">{{ getTeamScore('home') }}</div>
                  <div v-if="match.status !== 'Scheduled'" class="text-sm text-slate-400 mt-1">{{ getTeamOvers('home') }} overs</div>
                </div>

                <!-- VS Divider -->
                <div class="px-8 text-center">
                  <div class="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <span class="text-sm font-black text-white">VS</span>
                  </div>
                </div>

                <!-- Away Team -->
                <div class="flex-1 text-center">
                  <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-600 shadow-lg">
                    <img v-if="match.teams?.away?.logoUrl" :src="match.teams.away.logoUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-3xl font-bold text-amber-400">{{ match.teams?.away?.name?.charAt(0) }}</span>
                  </div>
                  <h3 class="font-bold text-white text-base mb-2">{{ match.teams?.away?.name }}</h3>
                  <div v-if="match.status !== 'Scheduled'" class="text-3xl font-black text-white tracking-tight">{{ getTeamScore('away') }}</div>
                  <div v-if="match.status !== 'Scheduled'" class="text-sm text-slate-400 mt-1">{{ getTeamOvers('away') }} overs</div>
                </div>
              </div>

              <!-- Result / Situation (only after 1st innings complete) -->
              <div v-if="match.status === 'Completed' && match.result" class="mt-6 text-center">
                <div class="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                  🏆 {{ match.result.summary || getResultText() }}
                </div>
              </div>
              
              <!-- Target Info Card - After 1st innings complete -->
              <div v-else-if="isFirstInningsComplete && match.status !== 'Completed'" class="mt-6">
                <div class="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-500/30">
                  <!-- Main Chase Line - Like AdminMatchEditor -->
                  <div v-if="hasSecondInningsStarted" class="text-center mb-4">
                    <p class="text-lg font-semibold text-amber-200">
                      {{ chasingTeamName }} need <span class="text-white font-bold">{{ runsNeeded }}</span> runs from <span class="text-white font-bold">{{ ballsRemaining }}</span> balls <span class="text-amber-400">(Target: {{ targetRuns }})</span>
                    </p>
                  </div>
                  <div v-else class="text-center mb-4">
                    <p class="text-lg font-semibold text-amber-200">
                      Target: <span class="text-3xl font-black text-white">{{ targetRuns }}</span> runs
                    </p>
                  </div>
                  
                  <!-- Run Rates - Styled like AdminMatchEditor -->
                  <div v-if="hasSecondInningsStarted" class="flex justify-center gap-8">
                    <div class="text-center bg-slate-800/50 rounded-xl py-3 px-6 border border-slate-700">
                      <div class="text-xs text-slate-400 mb-1">Current RR</div>
                      <div class="text-xl font-bold text-emerald-400">{{ currentRunRate }}</div>
                    </div>
                    <div class="text-center bg-slate-800/50 rounded-xl py-3 px-6 border border-slate-700">
                      <div class="text-xs text-slate-400 mb-1">Required RR</div>
                      <div class="text-xl font-bold text-amber-400">{{ requiredRunRate }}</div>
                    </div>
                  </div>
                  
                  <!-- Waiting for 2nd innings -->
                  <div v-if="!hasSecondInningsStarted" class="text-center text-slate-400 text-sm mt-2">
                    Waiting for 2nd innings to begin...
                  </div>
                </div>
              </div>

              <!-- Venue & Time -->
              <div class="mt-6 pt-5 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div class="flex items-center gap-6 text-sm text-slate-400">
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    {{ match.venue || 'Venue TBD' }}
                  </span>
                  <span v-if="match.time" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ match.time }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12 w-full">
        <!-- Navigation Tabs -->
        <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
          <div class="border-b border-slate-700/50">
            <nav class="flex flex-wrap gap-1 p-2">
              <button v-for="tab in tabs" :key="tab.key" 
                      @click="activeTab = tab.key"
                      :class="[
                        'group relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                        activeTab === tab.key 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                          : 'text-slate-300 hover:bg-slate-700/50'
                      ]">
                <span>{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <LiveMatchCenter v-if="activeTab === 'live'" :match="match" :rosters="rosters" />
            <ScorecardView v-if="activeTab === 'scorecard'" :match="match" />
            <OversView v-if="activeTab === 'overs'" :match="match" />
            <SquadView v-if="activeTab === 'squad'" :match="match" :rosters="rosters" />
            <StatsView v-if="activeTab === 'stats'" :match="match" />
            <InfoView v-if="activeTab === 'info'" :match="match" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/api';

import LiveMatchCenter from '../components/match/LiveMatchCenter.vue';
import ScorecardView from '../components/match/ScorecardView.vue';
import OversView from '../components/match/OversView.vue';
import SquadView from '../components/match/SquadView.vue';
import StatsView from '../components/match/StatsView.vue';
import InfoView from '../components/match/InfoView.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref('');
const match = ref(null);
const rosters = ref(null);
const activeTab = ref('live');
let updateInterval = null;

const tabs = [
  { key: 'live', label: 'Live', icon: '🔴' },
  { key: 'scorecard', label: 'Scorecard', icon: '📊' },
  { key: 'overs', label: 'Overs', icon: '🎯' },
  { key: 'squad', label: 'Squad', icon: '👥' },
  { key: 'stats', label: 'Stats', icon: '📈' },
  { key: 'info', label: 'Info', icon: 'ℹ️' }
];

const tournamentName = computed(() => match.value?.tournament?.name || match.value?.tournament?.title || 'Tournament');

// Check if first innings is complete (all out or overs finished)
const isFirstInningsComplete = computed(() => {
  if (!match.value?.innings?.length) return false;
  const firstInnings = match.value.innings[0];
  if (!firstInnings) return false;
  
  const wickets = firstInnings.totalWickets || firstInnings.wickets || 0;
  const balls = firstInnings.totalBalls || firstInnings.balls || 0;
  const oversLimit = (match.value.oversLimit || 20) * 6;
  
  // First innings is complete if all out (10 wickets) or overs completed
  return wickets >= 10 || balls >= oversLimit;
});

const currentSituation = computed(() => {
  // Only show situation after first innings is complete and second innings has started
  if (!match.value?.innings || match.value.innings.length < 2) return null;
  if (!isFirstInningsComplete.value) return null;
  
  const battingInnings = match.value.innings[1];
  const targetInnings = match.value.innings[0];
  if (!battingInnings || !targetInnings) return null;
  
  // Check if second innings has actually started (has at least some balls)
  const secondInningsBalls = battingInnings.totalBalls || battingInnings.balls || 0;
  if (secondInningsBalls === 0) return null;
  
  const target = (targetInnings.totalRuns || targetInnings.runs || 0) + 1;
  const current = battingInnings.totalRuns || battingInnings.runs || 0;
  const needed = target - current;
  const oversLimit = (match.value.oversLimit || 20) * 6;
  const remaining = oversLimit - secondInningsBalls;
  const wicketsLeft = 10 - (battingInnings.totalWickets || battingInnings.wickets || 0);
  
  if (needed <= 0) return null;
  return `Need ${needed} runs from ${remaining} balls (${wicketsLeft} wickets remaining)`;
});

// Target display when 1st innings is complete but 2nd innings hasn't started
const targetDisplay = computed(() => {
  if (!isFirstInningsComplete.value) return null;
  if (!match.value?.innings?.length) return null;
  
  const firstInnings = match.value.innings[0];
  if (!firstInnings) return null;
  
  const target = (firstInnings.totalRuns || firstInnings.runs || 0) + 1;
  
  // If 2nd innings has started, don't show this (currentSituation will handle it)
  if (match.value.innings.length >= 2) {
    const secondInnings = match.value.innings[1];
    const secondInningsBalls = secondInnings?.totalBalls || secondInnings?.balls || 0;
    if (secondInningsBalls > 0) return null;
  }
  
  return `Target: ${target} runs`;
});

// Chasing team name (team batting in 2nd innings)
const chasingTeamName = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return 'Team';
  const secondInnings = match.value.innings[1];
  const battingClubId = secondInnings?.battingClub;
  if (String(battingClubId) === String(match.value.teams?.home?.id)) return match.value.teams?.home?.name || 'Team';
  if (String(battingClubId) === String(match.value.teams?.away?.id)) return match.value.teams?.away?.name || 'Team';
  return 'Team';
});

// Check if we should show run rates
const showRunRates = computed(() => {
  if (!isFirstInningsComplete.value) return false;
  if (match.value?.status === 'Completed') return false;
  if (!match.value?.innings || match.value.innings.length < 2) return false;
  
  const secondInnings = match.value.innings[1];
  const secondInningsBalls = secondInnings?.totalBalls || secondInnings?.balls || 0;
  return secondInningsBalls > 0;
});

// Current run rate of 2nd innings
const currentRunRate = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return '0.00';
  const secondInnings = match.value.innings[1];
  const balls = secondInnings?.totalBalls || secondInnings?.balls || 0;
  const runs = secondInnings?.totalRuns || secondInnings?.runs || 0;
  if (balls === 0) return '0.00';
  const overs = balls / 6;
  return (runs / overs).toFixed(2);
});

// Required run rate
const requiredRunRate = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return '0.00';
  if (!isFirstInningsComplete.value) return '0.00';
  
  const firstInnings = match.value.innings[0];
  const secondInnings = match.value.innings[1];
  
  const target = (firstInnings?.totalRuns || firstInnings?.runs || 0) + 1;
  const current = secondInnings?.totalRuns || secondInnings?.runs || 0;
  const needed = target - current;
  
  const secondInningsBalls = secondInnings?.totalBalls || secondInnings?.balls || 0;
  const oversLimit = (match.value.oversLimit || 20) * 6;
  const ballsRem = oversLimit - secondInningsBalls;
  
  if (ballsRem <= 0 || needed <= 0) return '0.00';
  
  const oversRem = ballsRem / 6;
  return (needed / oversRem).toFixed(2);
});

// Target runs (1st innings score + 1)
const targetRuns = computed(() => {
  if (!match.value?.innings?.length) return 0;
  const firstInnings = match.value.innings[0];
  return (firstInnings?.totalRuns || firstInnings?.runs || 0) + 1;
});

// Check if 2nd innings has started
const hasSecondInningsStarted = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return false;
  const secondInnings = match.value.innings[1];
  const balls = secondInnings?.totalBalls || secondInnings?.balls || 0;
  return balls > 0;
});

// Runs needed to win
const runsNeeded = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return 0;
  const firstInnings = match.value.innings[0];
  const secondInnings = match.value.innings[1];
  const target = (firstInnings?.totalRuns || firstInnings?.runs || 0) + 1;
  const current = secondInnings?.totalRuns || secondInnings?.runs || 0;
  return Math.max(0, target - current);
});

// Balls remaining in 2nd innings
const ballsRemaining = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return 0;
  const secondInnings = match.value.innings[1];
  const balls = secondInnings?.totalBalls || secondInnings?.balls || 0;
  const oversLimit = (match.value.oversLimit || 20) * 6;
  return Math.max(0, oversLimit - balls);
});

// Overs remaining (formatted as X.Y)
const oversRemaining = computed(() => {
  const balls = ballsRemaining.value;
  const fullOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${fullOvers}.${remainingBalls}`;
});

// Wickets in hand
const wicketsInHand = computed(() => {
  if (!match.value?.innings || match.value.innings.length < 2) return 10;
  const secondInnings = match.value.innings[1];
  const wickets = secondInnings?.totalWickets || secondInnings?.wickets || 0;
  return Math.max(0, 10 - wickets);
});

function getTossWinnerName() {
  if (!match.value?.toss?.wonBy) return '';
  const tossWinnerId = String(match.value.toss.wonBy);
  if (tossWinnerId === String(match.value.teams?.home?.id)) return match.value.teams?.home?.name;
  if (tossWinnerId === String(match.value.teams?.away?.id)) return match.value.teams?.away?.name;
  return 'Unknown';
}

function goBack() { router.back(); }

function getTeamScore(teamType) {
  if (!match.value?.innings?.length) return '0/0';
  const teamId = match.value.teams?.[teamType]?.id;
  const innings = match.value.innings.find(inn => String(inn.battingClub) === String(teamId));
  if (!innings) return '0/0';
  return `${innings.totalRuns || innings.runs || 0}/${innings.totalWickets || innings.wickets || 0}`;
}

function getTeamOvers(teamType) {
  if (!match.value?.innings?.length) return '0.0';
  const teamId = match.value.teams?.[teamType]?.id;
  const innings = match.value.innings.find(inn => String(inn.battingClub) === String(teamId));
  if (!innings) return '0.0';
  if (innings.oversString) return innings.oversString;
  const balls = innings.totalBalls || innings.balls || 0;
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function getResultText() {
  if (!match.value?.result) return 'Match Completed';
  if (match.value.result.isTie) return 'Match Tied';
  if (match.value.result.isNoResult) return 'No Result';
  const winner = match.value.result.winner;
  const winnerName = String(winner) === String(match.value.teams?.home?.id) 
    ? match.value.teams?.home?.name 
    : match.value.teams?.away?.name;
  const margin = match.value.result.margin;
  if (margin?.runs) return `${winnerName} won by ${margin.runs} runs`;
  if (margin?.wickets) return `${winnerName} won by ${margin.wickets} wickets`;
  return `${winnerName} won`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadMatch() {
  try {
    loading.value = true;
    error.value = '';
    const { id: tournamentId, matchId } = route.params;
    const { data } = await api.get(`/tournaments/${tournamentId}/matches/${matchId}`);
    
    match.value = {
      ...data,
      teams: {
        home: { id: data.homeClub?._id, name: data.homeClub?.clubName || data.homeClub?.name, logoUrl: data.homeClub?.logoUrl },
        away: { id: data.awayClub?._id, name: data.awayClub?.clubName || data.awayClub?.name, logoUrl: data.awayClub?.logoUrl }
      }
    };
    
    try {
      const { data: rosterData } = await api.get(`/matches/${matchId}/roster`);
      rosters.value = rosterData;
    } catch (e) { rosters.value = null; }
  } catch (err) {
    error.value = err?.response?.data?.message || 'Failed to load match';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadMatch();
  const interval = match.value?.status === 'Live' ? 15000 : 60000;
  updateInterval = setInterval(loadMatch, interval);
});

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval);
});
</script>