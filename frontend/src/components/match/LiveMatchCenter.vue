<template>
  <div class="space-y-4">
    <!-- Match Summary Banner (Chase situation) -->
    <div v-if="situation" class="bg-blue-600 text-white rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium opacity-90">{{ chasingTeamName }} need</p>
          <p class="text-2xl font-bold">{{ runsNeeded }} runs</p>
          <p class="text-sm opacity-90">from {{ ballsRemaining }} balls</p>
        </div>
        <div class="text-right">
          <div class="flex gap-4">
            <div>
              <p class="text-xs opacity-70">CRR</p>
              <p class="text-lg font-bold">{{ currentRate }}</p>
            </div>
            <div>
              <p class="text-xs opacity-70">RRR</p>
              <p class="text-lg font-bold">{{ requiredRate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Batsmen - Google Style -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Batting</h3>
      </div>
      
      <div v-if="currentBatsmen.length" class="divide-y divide-gray-100">
        <div v-for="batsman in currentBatsmen" :key="batsman.playerName" 
             class="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
              {{ batsman.playerName?.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{ batsman.playerName }}</span>
                <span v-if="batsman.isStriker" class="text-[10px] px-1.5 py-0.5 bg-green-500 text-white rounded font-medium">*</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-xl font-bold text-gray-900">{{ batsman.runs || 0 }}</span>
              <span class="text-gray-400 text-sm ml-1">({{ batsman.balls || 0 }})</span>
            </div>
            <div class="flex gap-3 text-xs text-gray-500">
              <span>{{ batsman.fours || 0 }}×4</span>
              <span>{{ batsman.sixes || 0 }}×6</span>
              <span class="text-gray-900 font-medium">SR {{ getStrikeRate(batsman.runs, batsman.balls) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="px-4 py-6 text-center text-gray-400 text-sm">
        Waiting for batting data
      </div>
    </div>

    <!-- Current Bowler - Google Style -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bowling</h3>
      </div>
      
      <div v-if="currentBowler" class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-600">
            {{ currentBowler.bowlerName?.charAt(0) }}
          </div>
          <span class="font-medium text-gray-900">{{ currentBowler.bowlerName }}</span>
        </div>
        <div class="flex items-center gap-6">
          <div class="font-mono text-gray-900 font-semibold">
            {{ toOvers(currentBowler.balls) }}-{{ currentBowler.maidens || 0 }}-{{ currentBowler.runs || 0 }}-{{ currentBowler.wickets || 0 }}
          </div>
          <span class="text-xs text-gray-500">Econ {{ getEconomy(currentBowler.runs, currentBowler.balls) }}</span>
        </div>
      </div>
      <div v-else class="px-4 py-6 text-center text-gray-400 text-sm">
        Waiting for bowling data
      </div>
    </div>

    <!-- This Over - Google Style Ball Tracker -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">This Over</h3>
        <span class="text-xs text-gray-500">Over {{ currentOverNumber }}</span>
      </div>
      
      <div class="px-4 py-4">
        <div class="flex items-center gap-2 mb-3">
          <div v-for="(ball, idx) in thisOverBalls" :key="idx" 
               :class="getBallClass(ball)"
               class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold">
            {{ getBallDisplay(ball) }}
          </div>
          <div v-for="n in Math.max(0, 6 - thisOverBalls.length)" :key="'e-' + n" 
               class="w-9 h-9 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
            •
          </div>
        </div>
        <div class="text-sm text-gray-500">
          <span class="font-medium text-gray-900">{{ thisOverRuns }}</span> runs this over
          <span v-if="thisOverWickets"> • <span class="text-red-600">{{ thisOverWickets }} wicket{{ thisOverWickets > 1 ? 's' : '' }}</span></span>
        </div>
      </div>
    </div>

    <!-- Partnership -->
    <div v-if="currentBatsmen.length >= 2" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">Partnership</span>
        <span class="font-semibold text-gray-900">{{ partnershipRuns }} ({{ partnershipBalls }})</span>
      </div>
    </div>

    <!-- Recent Overs -->
    <div v-if="recentOvers.length" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Overs</h3>
      </div>
      <div class="px-4 py-3 flex gap-4 overflow-x-auto">
        <div v-for="over in recentOvers" :key="over.overNumber" class="flex-shrink-0 text-center">
          <div class="text-xs text-gray-400 mb-1">Ov {{ over.overNumber }}</div>
          <div class="text-lg font-bold text-gray-900">{{ over.totalRuns }}</div>
        </div>
      </div>
    </div>

    <!-- Key Events - Timeline Style -->
    <div v-if="keyMoments.length" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Key Events</h3>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="moment in keyMoments.slice(0, 5)" :key="moment.id" 
             class="px-4 py-3 flex items-center gap-3">
          <span :class="[
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
            moment.type === 'wicket' ? 'bg-red-100 text-red-600' :
            moment.type === 'six' ? 'bg-amber-100 text-amber-600' :
            'bg-green-100 text-green-600'
          ]">
            {{ moment.type === 'wicket' ? 'W' : moment.type === 'six' ? '6' : '4' }}
          </span>
          <div class="flex-1">
            <p class="text-sm text-gray-900">{{ moment.text }}</p>
            <p class="text-xs text-gray-400">{{ moment.over }} ov</p>
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
  if (ball.wicket?.how) return 'bg-red-500 text-white';
  if (ball.runs === 6) return 'bg-amber-500 text-white';
  if (ball.runs === 4) return 'bg-emerald-500 text-white';
  if (ball.extras !== 'none') return 'bg-blue-500 text-white';
  if (ball.runs === 0) return 'bg-gray-300 text-gray-700';
  return 'bg-gray-100 text-gray-900 border border-gray-300';
}

function getBallDisplay(ball) {
  if (ball.wicket?.how) return 'W';
  if (ball.extras === 'wide') return 'Wd';
  if (ball.extras === 'no-ball') return 'Nb';
  return ball.runs;
}
</script>
