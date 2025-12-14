<template>
  <div class="space-y-6">
    <!-- Innings Selector -->
    <div class="flex gap-2">
      <button v-for="(innings, idx) in match?.innings || []" :key="idx"
              @click="selectedInnings = idx"
              :class="[
                'flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all',
                selectedInnings === idx 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              ]">
        {{ getInningsLabel(innings, idx) }}
      </button>
    </div>

    <div v-if="currentInnings">
      <!-- Innings Summary -->
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold">{{ currentInnings.totalRuns || currentInnings.runs || 0 }}/{{ currentInnings.totalWickets || currentInnings.wickets || 0 }}</div>
            <div class="text-indigo-100">{{ getOversString(currentInnings) }} overs</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-indigo-100">Run Rate</div>
            <div class="text-2xl font-bold">{{ getRunRate(currentInnings) }}</div>
          </div>
        </div>
      </div>

      <!-- Batting Card -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>🏏</span> Batting
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr class="text-left text-xs font-semibold text-gray-600 uppercase">
                <th class="px-4 py-3">Batter</th>
                <th class="px-4 py-3 text-center">R</th>
                <th class="px-4 py-3 text-center">B</th>
                <th class="px-4 py-3 text-center">4s</th>
                <th class="px-4 py-3 text-center">6s</th>
                <th class="px-4 py-3 text-center">SR</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="batsman in currentInnings.battingCard || []" :key="batsman.playerName" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="font-semibold text-gray-900">{{ batsman.playerName }}</div>
                  <div class="text-xs text-gray-500">{{ getDismissalText(batsman) }}</div>
                </td>
                <td class="px-4 py-3 text-center font-bold text-gray-900">{{ batsman.runs || 0 }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ batsman.balls || 0 }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ batsman.fours || 0 }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ batsman.sixes || 0 }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ getStrikeRate(batsman.runs, batsman.balls) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Extras & Total -->
        <div class="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Extras</span>
            <span class="font-medium text-gray-900">{{ getTotalExtras(currentInnings) }} ({{ getExtrasBreakdown(currentInnings) }})</span>
          </div>
        </div>
        <div class="border-t border-gray-200 px-4 py-3 bg-emerald-50">
          <div class="flex justify-between">
            <span class="font-semibold text-gray-900">Total</span>
            <span class="font-bold text-emerald-700">{{ currentInnings.totalRuns || currentInnings.runs || 0 }}/{{ currentInnings.totalWickets || currentInnings.wickets || 0 }} ({{ getOversString(currentInnings) }} ov)</span>
          </div>
        </div>
      </div>

      <!-- Fall of Wickets -->
      <div v-if="currentInnings.fallOfWickets?.length" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Fall of Wickets</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="(fow, idx) in currentInnings.fallOfWickets" :key="idx" 
                class="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {{ idx + 1 }}-{{ fow.score }} ({{ fow.batsman }}, {{ fow.over }})
          </span>
        </div>
      </div>

      <!-- Bowling Card -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> Bowling
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr class="text-left text-xs font-semibold text-gray-600 uppercase">
                <th class="px-4 py-3">Bowler</th>
                <th class="px-4 py-3 text-center">O</th>
                <th class="px-4 py-3 text-center">M</th>
                <th class="px-4 py-3 text-center">R</th>
                <th class="px-4 py-3 text-center">W</th>
                <th class="px-4 py-3 text-center">Econ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="bowler in currentInnings.bowlingCard || []" :key="bowler.bowlerName" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-semibold text-gray-900">{{ bowler.bowlerName }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ toOvers(bowler.balls) }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ bowler.maidens || 0 }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ bowler.runs || 0 }}</td>
                <td class="px-4 py-3 text-center font-bold text-red-600">{{ bowler.wickets || 0 }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ getEconomy(bowler.runs, bowler.balls) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-gray-500">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <p class="font-medium">No scorecard data available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true }
});

const selectedInnings = ref(0);
const currentInnings = computed(() => props.match?.innings?.[selectedInnings.value] || null);

function getInningsLabel(innings, idx) {
  const teamId = innings.battingClub;
  const teamName = String(teamId) === String(props.match.teams?.home?.id) 
    ? props.match.teams?.home?.name 
    : props.match.teams?.away?.name;
  return `${teamName || 'Team'} - ${idx === 0 ? '1st' : '2nd'} Innings`;
}

function getOversString(innings) {
  if (innings.oversString) return innings.oversString;
  const balls = innings.totalBalls || innings.balls || 0;
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function getRunRate(innings) {
  const runs = innings.totalRuns || innings.runs || 0;
  const balls = innings.totalBalls || innings.balls || 0;
  return balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00';
}

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

function getDismissalText(batsman) {
  if (!batsman.dismissal?.how) return 'not out';
  const d = batsman.dismissal;
  if (d.how === 'bowled') return `b ${d.bowler}`;
  if (d.how === 'lbw') return `lbw b ${d.bowler}`;
  if (d.how === 'caught') return `c ${d.fielder} b ${d.bowler}`;
  if (d.how === 'run out') return `run out (${d.fielder})`;
  if (d.how === 'stumped') return `st ${d.fielder} b ${d.bowler}`;
  return d.how;
}

function getTotalExtras(innings) {
  if (!innings.extras) return 0;
  return innings.extras.total || (innings.extras.wides || 0) + (innings.extras.noBalls || 0) + (innings.extras.byes || 0) + (innings.extras.legByes || 0);
}

function getExtrasBreakdown(innings) {
  if (!innings.extras) return 'No extras';
  const e = innings.extras;
  const parts = [];
  if (e.wides) parts.push(`wd ${e.wides}`);
  if (e.noBalls) parts.push(`nb ${e.noBalls}`);
  if (e.byes) parts.push(`b ${e.byes}`);
  if (e.legByes) parts.push(`lb ${e.legByes}`);
  return parts.length ? parts.join(', ') : 'No extras';
}
</script>
