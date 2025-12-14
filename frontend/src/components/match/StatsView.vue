<template>
  <div class="space-y-6">
    <!-- Match Comparison -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-6">Match Comparison</h3>
      <div class="space-y-4">
        <div v-for="stat in comparisonStats" :key="stat.label" class="flex items-center gap-4">
          <div class="w-12 text-right font-bold text-blue-600">{{ stat.home }}</div>
          <div class="flex-1">
            <div class="h-8 bg-gray-100 rounded-full overflow-hidden relative">
              <div class="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-l-full transition-all" 
                   :style="{ width: getBarWidth(stat.home, stat.away, 'home') }"></div>
              <div class="absolute right-0 top-0 h-full bg-gradient-to-l from-purple-500 to-purple-400 rounded-r-full transition-all" 
                   :style="{ width: getBarWidth(stat.home, stat.away, 'away') }"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-medium text-gray-700 bg-white/80 px-2 py-0.5 rounded-full">{{ stat.label }}</span>
              </div>
            </div>
          </div>
          <div class="w-12 text-left font-bold text-purple-600">{{ stat.away }}</div>
        </div>
      </div>
    </div>

    <!-- Partnerships -->
    <div v-if="partnerships.length" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Partnership Breakdown</h3>
      <div class="space-y-3">
        <div v-for="(p, idx) in partnerships" :key="idx" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
            {{ idx + 1 }}
          </div>
          <div class="flex-1">
            <div class="h-6 bg-white rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all" 
                   :style="{ width: getPartnershipWidth(p.runs) }"></div>
            </div>
          </div>
          <div class="text-sm font-semibold text-gray-700 w-20 text-right">{{ p.runs }} runs</div>
        </div>
      </div>
    </div>

    <!-- Top Performers -->
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
      <h3 class="text-lg font-bold text-gray-900 mb-4">⭐ Top Performers</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🏏</span>
            <span class="text-sm text-gray-500">Most Runs</span>
          </div>
          <div class="font-semibold text-gray-900">{{ topScorer.name }}</div>
          <div class="text-sm text-emerald-600 font-medium">{{ topScorer.value }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🎯</span>
            <span class="text-sm text-gray-500">Most Wickets</span>
          </div>
          <div class="font-semibold text-gray-900">{{ topWicketTaker.name }}</div>
          <div class="text-sm text-red-600 font-medium">{{ topWicketTaker.value }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">⚡</span>
            <span class="text-sm text-gray-500">Best Strike Rate</span>
          </div>
          <div class="font-semibold text-gray-900">{{ bestStrikeRate.name }}</div>
          <div class="text-sm text-amber-600 font-medium">{{ bestStrikeRate.value }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">💰</span>
            <span class="text-sm text-gray-500">Best Economy</span>
          </div>
          <div class="font-semibold text-gray-900">{{ bestEconomy.name }}</div>
          <div class="text-sm text-blue-600 font-medium">{{ bestEconomy.value }}</div>
        </div>
      </div>

      <!-- Player of the Match -->
      <div v-if="match.summary?.playerOfTheMatch" class="mt-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 text-center">
        <div class="text-sm text-white/80 mb-1">🏆 Player of the Match</div>
        <div class="text-xl font-bold text-white">{{ match.summary.playerOfTheMatch }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true }
});

const comparisonStats = computed(() => {
  const innings = props.match?.innings || [];
  if (innings.length < 2) return [];

  const home = innings.find(i => String(i.battingClub) === String(props.match.teams?.home?.id)) || {};
  const away = innings.find(i => String(i.battingClub) === String(props.match.teams?.away?.id)) || {};

  const homeExtras = home.extras || {};
  const awayExtras = away.extras || {};

  const countBoundaries = (inn, type) => (inn.battingCard || []).reduce((sum, b) => sum + (type === 4 ? (b.fours || 0) : (b.sixes || 0)), 0);

  return [
    { label: 'Total Runs', home: home.totalRuns || home.runs || 0, away: away.totalRuns || away.runs || 0 },
    { label: 'Wickets', home: home.totalWickets || home.wickets || 0, away: away.totalWickets || away.wickets || 0 },
    { label: 'Fours', home: countBoundaries(home, 4), away: countBoundaries(away, 4) },
    { label: 'Sixes', home: countBoundaries(home, 6), away: countBoundaries(away, 6) },
    { label: 'Extras', home: homeExtras.total || 0, away: awayExtras.total || 0 }
  ];
});

function getBarWidth(home, away, side) {
  const total = home + away || 1;
  const val = side === 'home' ? home : away;
  return `${Math.round((val / total) * 50)}%`;
}

const partnerships = computed(() => {
  const innings = props.match?.innings?.[0];
  if (!innings?.fallOfWickets?.length) return [];
  const fow = innings.fallOfWickets;
  const parts = [];
  for (let i = 0; i < fow.length && i < 5; i++) {
    const prev = i > 0 ? fow[i - 1].score : 0;
    parts.push({ runs: fow[i].score - prev });
  }
  return parts;
});

function getPartnershipWidth(runs) {
  const max = Math.max(...partnerships.value.map(p => p.runs), 1);
  return `${Math.round((runs / max) * 100)}%`;
}

const allBatsmen = computed(() => {
  const list = [];
  (props.match?.innings || []).forEach(inn => {
    (inn.battingCard || []).forEach(b => list.push(b));
  });
  return list;
});

const allBowlers = computed(() => {
  const list = [];
  (props.match?.innings || []).forEach(inn => {
    (inn.bowlingCard || []).forEach(b => list.push(b));
  });
  return list;
});

const topScorer = computed(() => {
  const sorted = [...allBatsmen.value].sort((a, b) => (b.runs || 0) - (a.runs || 0));
  const top = sorted[0] || {};
  return { name: top.playerName || '-', value: top.runs ? `${top.runs} (${top.balls})` : '-' };
});

const topWicketTaker = computed(() => {
  const sorted = [...allBowlers.value].sort((a, b) => (b.wickets || 0) - (a.wickets || 0));
  const top = sorted[0] || {};
  const overs = top.balls ? `${Math.floor(top.balls / 6)}.${top.balls % 6}` : '0';
  return { name: top.bowlerName || '-', value: top.wickets ? `${top.wickets}/${top.runs} (${overs})` : '-' };
});

const bestStrikeRate = computed(() => {
  const qualified = allBatsmen.value.filter(b => (b.balls || 0) >= 10);
  const sorted = [...qualified].sort((a, b) => {
    const srA = a.balls ? (a.runs / a.balls) * 100 : 0;
    const srB = b.balls ? (b.runs / b.balls) * 100 : 0;
    return srB - srA;
  });
  const top = sorted[0] || {};
  const sr = top.balls ? ((top.runs / top.balls) * 100).toFixed(1) : '0';
  return { name: top.playerName || '-', value: sr };
});

const bestEconomy = computed(() => {
  const qualified = allBowlers.value.filter(b => (b.balls || 0) >= 12);
  const sorted = [...qualified].sort((a, b) => {
    const eA = a.balls ? (a.runs / a.balls) * 6 : 99;
    const eB = b.balls ? (b.runs / b.balls) * 6 : 99;
    return eA - eB;
  });
  const top = sorted[0] || {};
  const econ = top.balls ? ((top.runs / top.balls) * 6).toFixed(2) : '0';
  return { name: top.bowlerName || '-', value: econ };
});
</script>
