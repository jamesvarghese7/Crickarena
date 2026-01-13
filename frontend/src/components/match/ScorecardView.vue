<template>
  <div class="space-y-6">
    <!-- Innings Selector -->
    <div class="flex gap-2">
      <button v-for="(innings, idx) in match?.innings || []" :key="idx"
              @click="selectedInnings = idx"
              :class="[
                'flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300',
                selectedInnings === idx 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 backdrop-blur-sm'
              ]">
        {{ getInningsLabel(innings, idx) }}
      </button>
    </div>

    <div v-if="currentInnings">
      <!-- Innings Summary -->
      <div class="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-sm rounded-2xl p-6 text-white border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-4xl font-black">{{ currentInnings.totalRuns || currentInnings.runs || 0 }}/{{ currentInnings.totalWickets || currentInnings.wickets || 0 }}</div>
            <div class="text-indigo-200 mt-1">{{ getOversString(currentInnings) }} overs</div>
          </div>
          <div class="text-right bg-slate-900/40 rounded-xl px-5 py-3 border border-white/10">
            <div class="text-xs text-indigo-200 mb-1">Run Rate</div>
            <div class="text-3xl font-black">{{ getRunRate(currentInnings) }}</div>
          </div>
        </div>
      </div>

      <!-- Batting Card -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden mt-6">
        <div class="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 px-6 py-4 border-b border-blue-500/30">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>🏏</span> Batting
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-900/50">
              <tr class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th class="px-5 py-4">Batter</th>
                <th class="px-4 py-4 text-center">R</th>
                <th class="px-4 py-4 text-center">B</th>
                <th class="px-4 py-4 text-center">4s</th>
                <th class="px-4 py-4 text-center">6s</th>
                <th class="px-4 py-4 text-center">SR</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <tr v-for="batsman in currentInnings.battingCard || []" :key="batsman.playerName" class="hover:bg-slate-700/30 transition-colors">
                <td class="px-5 py-4">
                  <div class="font-semibold text-white">{{ batsman.playerName }}</div>
                  <div class="text-xs text-slate-500">{{ getDismissalText(batsman) }}</div>
                </td>
                <td class="px-4 py-4 text-center font-bold text-white text-lg">{{ batsman.runs || 0 }}</td>
                <td class="px-4 py-4 text-center text-slate-400">{{ batsman.balls || 0 }}</td>
                <td class="px-4 py-4 text-center text-slate-400">{{ batsman.fours || 0 }}</td>
                <td class="px-4 py-4 text-center text-slate-400">{{ batsman.sixes || 0 }}</td>
                <td class="px-4 py-4 text-center text-emerald-400 font-medium">{{ getStrikeRate(batsman.runs, batsman.balls) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Extras & Total -->
        <div class="border-t border-slate-700/50 px-5 py-3 bg-slate-900/30">
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Extras</span>
            <span class="font-medium text-white">{{ getTotalExtras(currentInnings) }} <span class="text-slate-500">({{ getExtrasBreakdown(currentInnings) }})</span></span>
          </div>
        </div>
        <div class="border-t border-slate-700/50 px-5 py-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
          <div class="flex justify-between">
            <span class="font-bold text-white">Total</span>
            <span class="font-bold text-emerald-400 text-lg">{{ currentInnings.totalRuns || currentInnings.runs || 0 }}/{{ currentInnings.totalWickets || currentInnings.wickets || 0 }} ({{ getOversString(currentInnings) }} ov)</span>
          </div>
        </div>
      </div>

      <!-- Fall of Wickets -->
      <div v-if="currentInnings.fallOfWickets?.length" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl mt-6">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-red-400">📉</span> Fall of Wickets
        </h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="(fow, idx) in currentInnings.fallOfWickets" :key="idx" 
                class="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/30 font-medium">
            {{ idx + 1 }}-{{ fow.score }} ({{ fow.batsman }}, {{ fow.over }})
          </span>
        </div>
      </div>

      <!-- Bowling Card -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden mt-6">
        <div class="bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-4 border-b border-purple-500/30">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> Bowling
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-900/50">
              <tr class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th class="px-5 py-4">Bowler</th>
                <th class="px-4 py-4 text-center">O</th>
                <th class="px-4 py-4 text-center">M</th>
                <th class="px-4 py-4 text-center">R</th>
                <th class="px-4 py-4 text-center">W</th>
                <th class="px-4 py-4 text-center">Econ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <tr v-for="bowler in currentInnings.bowlingCard || []" :key="bowler.bowlerName" class="hover:bg-slate-700/30 transition-colors">
                <td class="px-5 py-4 font-semibold text-white">{{ bowler.bowlerName }}</td>
                <td class="px-4 py-4 text-center text-slate-400">{{ toOvers(bowler.balls) }}</td>
                <td class="px-4 py-4 text-center text-slate-400">{{ bowler.maidens || 0 }}</td>
                <td class="px-4 py-4 text-center text-slate-400">{{ bowler.runs || 0 }}</td>
                <td class="px-4 py-4 text-center font-bold text-red-400 text-lg">{{ bowler.wickets || 0 }}</td>
                <td class="px-4 py-4 text-center text-amber-400 font-medium">{{ getEconomy(bowler.runs, bowler.balls) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
        <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <p class="font-medium text-slate-400">No scorecard data available</p>
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
