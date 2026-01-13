<template>
  <div class="space-y-4">
    <!-- Match Summary Banner (Chase situation) -->
    <div v-if="situation" class="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30 shadow-lg shadow-blue-500/10">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-blue-100">{{ chasingTeamName }} need</p>
          <p class="text-3xl font-black text-white">{{ runsNeeded }} runs</p>
          <p class="text-sm text-blue-200">from {{ ballsRemaining }} balls</p>
        </div>
        <div class="text-right">
          <div class="flex gap-6">
            <div class="bg-slate-900/50 rounded-xl px-4 py-2 border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-1">CRR</p>
              <p class="text-xl font-bold text-emerald-400">{{ currentRate }}</p>
            </div>
            <div class="bg-slate-900/50 rounded-xl px-4 py-2 border border-slate-700/50">
              <p class="text-xs text-slate-400 mb-1">RRR</p>
              <p class="text-xl font-bold text-amber-400">{{ requiredRate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Batsmen -->
    <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🏏</span> Batting
        </h3>
      </div>
      
      <div v-if="currentBatsmen.length" class="divide-y divide-slate-700/30">
        <div v-for="batsman in currentBatsmen" :key="batsman.playerName" 
             class="px-5 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white border border-slate-600">
              {{ batsman.playerName?.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-white">{{ batsman.playerName }}</span>
                <span v-if="batsman.isStriker" class="text-[10px] px-2 py-0.5 bg-emerald-500/80 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20">*</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-8">
            <div class="text-right">
              <span class="text-2xl font-black text-white">{{ batsman.runs || 0 }}</span>
              <span class="text-slate-400 text-sm ml-1">({{ batsman.balls || 0 }})</span>
            </div>
            <div class="flex gap-4 text-xs text-slate-400">
              <span class="bg-slate-700/50 px-2 py-1 rounded">{{ batsman.fours || 0 }}×4</span>
              <span class="bg-slate-700/50 px-2 py-1 rounded">{{ batsman.sixes || 0 }}×6</span>
              <span class="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">SR {{ getStrikeRate(batsman.runs, batsman.balls) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="px-5 py-10 text-center text-slate-500 text-sm">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center">
          <span class="text-2xl opacity-50">🏏</span>
        </div>
        Waiting for batting data
      </div>
    </div>

    <!-- Current Bowler -->
    <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🎯</span> Bowling
        </h3>
      </div>
      
      <div v-if="currentBowler" class="px-5 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/50 to-pink-600/50 flex items-center justify-center text-sm font-bold text-white border border-purple-500/30">
            {{ currentBowler.bowlerName?.charAt(0) }}
          </div>
          <span class="font-semibold text-white">{{ currentBowler.bowlerName }}</span>
        </div>
        <div class="flex items-center gap-6">
          <div class="font-mono text-white font-bold text-lg bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-600/50">
            {{ toOvers(currentBowler.balls) }}-{{ currentBowler.maidens || 0 }}-{{ currentBowler.runs || 0 }}-<span class="text-red-400">{{ currentBowler.wickets || 0 }}</span>
          </div>
          <span class="text-xs text-slate-400 bg-slate-700/50 px-3 py-2 rounded-lg">Econ <span class="text-amber-400 font-semibold">{{ getEconomy(currentBowler.runs, currentBowler.balls) }}</span></span>
        </div>
      </div>
      <div v-else class="px-5 py-10 text-center text-slate-500 text-sm">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center">
          <span class="text-2xl opacity-50">🎯</span>
        </div>
        Waiting for bowling data
      </div>
    </div>

    <!-- This Over - Ball Tracker -->
    <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🔴</span> This Over
        </h3>
        <span class="text-xs text-slate-500 bg-slate-700/50 px-3 py-1 rounded-full">Over {{ currentOverNumber }}</span>
      </div>
      
      <div class="px-5 py-5">
        <div class="flex items-center gap-3 mb-4">
          <div v-for="(ball, idx) in thisOverBalls" :key="idx" 
               :class="getBallClass(ball)"
               class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-transform hover:scale-110">
            {{ getBallDisplay(ball) }}
          </div>
          <div v-for="n in Math.max(0, 6 - thisOverBalls.length)" :key="'e-' + n" 
               class="w-11 h-11 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-600">
            •
          </div>
        </div>
        <div class="text-sm text-slate-400 flex items-center gap-3">
          <span><span class="font-bold text-white">{{ thisOverRuns }}</span> runs this over</span>
          <span v-if="thisOverWickets" class="flex items-center gap-1">
            •
            <span class="text-red-400 font-bold">{{ thisOverWickets }} wicket{{ thisOverWickets > 1 ? 's' : '' }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Partnership -->
    <div v-if="currentBatsmen.length >= 2" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
      <div class="flex items-center justify-between">
        <span class="text-sm text-slate-400 flex items-center gap-2">
          <span class="text-lg">🤝</span> Partnership
        </span>
        <span class="font-bold text-white text-lg">{{ partnershipRuns }} <span class="text-slate-400 text-sm font-normal">({{ partnershipBalls }})</span></span>
      </div>
    </div>

    <!-- Recent Overs -->
    <div v-if="recentOvers.length" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Overs</h3>
      </div>
      <div class="px-5 py-4 flex gap-4 overflow-x-auto">
        <div v-for="over in recentOvers" :key="over.overNumber" class="flex-shrink-0 text-center bg-slate-700/30 rounded-xl px-5 py-3 border border-slate-600/30">
          <div class="text-xs text-slate-500 mb-1">Ov {{ over.overNumber }}</div>
          <div class="text-xl font-bold text-white">{{ over.totalRuns }}</div>
        </div>
      </div>
    </div>

    <!-- Key Events - Timeline Style -->
    <div v-if="keyMoments.length" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">⚡</span> Key Events
        </h3>
      </div>
      <div class="divide-y divide-slate-700/30">
        <div v-for="moment in keyMoments.slice(0, 5)" :key="moment.id" 
             class="px-5 py-3 flex items-center gap-4 hover:bg-slate-700/20 transition-colors">
          <span :class="[
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-lg',
            moment.type === 'wicket' ? 'bg-red-500/80 text-white shadow-red-500/30' :
            moment.type === 'six' ? 'bg-amber-500/80 text-white shadow-amber-500/30' :
            'bg-emerald-500/80 text-white shadow-emerald-500/30'
          ]">
            {{ moment.type === 'wicket' ? 'W' : moment.type === 'six' ? '6' : '4' }}
          </span>
          <div class="flex-1">
            <p class="text-sm text-white">{{ moment.text }}</p>
            <p class="text-xs text-slate-500">{{ moment.over }} ov</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true },
  rosters: { type: Object, default: null }
});

const currentInnings = computed(() => {
  if (!props.match?.innings?.length) return null;
  return props.match.innings[props.match.innings.length - 1];
});

const targetInnings = computed(() => {
  if (props.match?.innings?.length < 2) return null;
  return props.match.innings[0];
});

// Check if first innings is complete
const isFirstInningsComplete = computed(() => {
  if (!targetInnings.value) return false;
  const wickets = targetInnings.value.totalWickets || targetInnings.value.wickets || 0;
  const balls = targetInnings.value.totalBalls || targetInnings.value.balls || 0;
  const oversLimit = (props.match.oversLimit || 20) * 6;
  return wickets >= 10 || balls >= oversLimit;
});

const situation = computed(() => {
  // Only show after first innings completes and second innings has started
  if (!currentInnings.value || !targetInnings.value) return null;
  if (!isFirstInningsComplete.value) return null;
  
  // Check second innings has started
  const secondBalls = currentInnings.value.totalBalls || currentInnings.value.balls || 0;
  if (secondBalls === 0) return null;
  
  const target = (targetInnings.value.totalRuns || targetInnings.value.runs || 0) + 1;
  const current = currentInnings.value.totalRuns || currentInnings.value.runs || 0;
  const needed = target - current;
  const oversLimit = (props.match.oversLimit || 20) * 6;
  const remaining = oversLimit - secondBalls;
  const wicketsLeft = 10 - (currentInnings.value.totalWickets || currentInnings.value.wickets || 0);
  if (needed <= 0) return null;
  return `Need ${needed} runs from ${remaining} balls with ${wicketsLeft} wickets in hand`;
});

const requiredRate = computed(() => {
  if (!situation.value) return '0.00';
  const target = (targetInnings.value?.totalRuns || targetInnings.value?.runs || 0) + 1;
  const current = currentInnings.value?.totalRuns || currentInnings.value?.runs || 0;
  const needed = target - current;
  const balls = currentInnings.value?.totalBalls || currentInnings.value?.balls || 0;
  const remaining = ((props.match.oversLimit || 20) * 6) - balls;
  return remaining > 0 ? ((needed / remaining) * 6).toFixed(2) : '0.00';
});

const currentRate = computed(() => {
  if (!currentInnings.value) return '0.00';
  const runs = currentInnings.value.totalRuns || currentInnings.value.runs || 0;
  const balls = currentInnings.value.totalBalls || currentInnings.value.balls || 0;
  return balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00';
});

// Chasing team name
const chasingTeamName = computed(() => {
  if (!currentInnings.value) return 'Team';
  const battingClubId = currentInnings.value.battingClub;
  if (battingClubId === props.match.teams?.home?.id) return props.match.teams?.home?.name || 'Team';
  if (battingClubId === props.match.teams?.away?.id) return props.match.teams?.away?.name || 'Team';
  return 'Team';
});

// Runs needed to win
const runsNeeded = computed(() => {
  if (!targetInnings.value || !currentInnings.value) return 0;
  const target = (targetInnings.value.totalRuns || targetInnings.value.runs || 0) + 1;
  const current = currentInnings.value.totalRuns || currentInnings.value.runs || 0;
  return Math.max(0, target - current);
});

// Balls remaining
const ballsRemaining = computed(() => {
  if (!currentInnings.value) return 0;
  const balls = currentInnings.value.totalBalls || currentInnings.value.balls || 0;
  const oversLimit = (props.match.oversLimit || 20) * 6;
  return Math.max(0, oversLimit - balls);
});

// Partnership runs (simplified)
const partnershipRuns = computed(() => {
  // For now, sum of current batsmen runs as a simple approximation
  return currentBatsmen.value.reduce((sum, b) => sum + (b.runs || 0), 0);
});

// Partnership balls (simplified)
const partnershipBalls = computed(() => {
  return currentBatsmen.value.reduce((sum, b) => sum + (b.balls || 0), 0);
});

const currentBatsmen = computed(() => {
  if (!currentInnings.value?.battingCard?.length) return [];
  const notOut = currentInnings.value.battingCard.filter(b => !b.dismissal?.how);
  return notOut.slice(-2).map((b, i) => ({ ...b, isStriker: i === notOut.length - 1 }));
});

const currentBowler = computed(() => {
  if (!currentInnings.value?.bowlingCard?.length) return null;
  return currentInnings.value.bowlingCard[currentInnings.value.bowlingCard.length - 1];
});

const currentOverNumber = computed(() => currentInnings.value?.currentOver || 1);

const thisOverBalls = computed(() => {
  if (!currentInnings.value?.overs?.length) return [];
  const lastOver = currentInnings.value.overs[currentInnings.value.overs.length - 1];
  return lastOver?.balls || [];
});

const thisOverRuns = computed(() => thisOverBalls.value.reduce((sum, b) => sum + (b.runs || 0), 0));
const thisOverWickets = computed(() => thisOverBalls.value.filter(b => b.wicket?.how).length);

const recentOvers = computed(() => {
  if (!currentInnings.value?.overs?.length) return [];
  return currentInnings.value.overs.slice(-4, -1).reverse();
});

const keyMoments = computed(() => {
  const moments = [];
  if (!currentInnings.value?.overs) return moments;
  
  currentInnings.value.overs.forEach(over => {
    over.balls?.forEach(ball => {
      if (ball.wicket?.how) {
        moments.push({ id: `${over.overNumber}.${ball.ballNumber}w`, over: `${over.overNumber}.${ball.ballNumber}`, text: `WICKET! ${ball.wicket.batsman} ${ball.wicket.how}`, type: 'wicket' });
      }
      if (ball.runs === 6) {
        moments.push({ id: `${over.overNumber}.${ball.ballNumber}s`, over: `${over.overNumber}.${ball.ballNumber}`, text: `SIX by ${ball.batsman}`, type: 'six' });
      }
      if (ball.runs === 4) {
        moments.push({ id: `${over.overNumber}.${ball.ballNumber}f`, over: `${over.overNumber}.${ball.ballNumber}`, text: `FOUR by ${ball.batsman}`, type: 'four' });
      }
    });
  });
  return moments.slice(-10).reverse();
});

function getStrikeRate(runs, balls) {
  return balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
}

function getEconomy(runs, balls) {
  return balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00';
}

function toOvers(balls) {
  const b = Number(balls) || 0;
  return `${Math.floor(b / 6)}.${b % 6}`;
}

function getBallClass(ball) {
  if (ball.wicket?.how) return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/40';
  if (ball.runs === 6) return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/40';
  if (ball.runs === 4) return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-500/40';
  if (ball.extras !== 'none') return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-500/40';
  if (ball.runs === 0) return 'bg-slate-600 text-slate-300';
  return 'bg-slate-700 text-white border border-slate-500';
}

function getBallDisplay(ball) {
  if (ball.wicket?.how) return 'W';
  if (ball.extras === 'wide') return 'Wd';
  if (ball.extras === 'no-ball') return 'Nb';
  return ball.runs;
}
</script>
