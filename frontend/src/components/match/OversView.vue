<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap gap-3">
      <!-- Filter -->
      <div class="flex gap-2">
        <button v-for="filter in filters" :key="filter.key"
                @click="activeFilter = filter.key"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                  activeFilter === filter.key 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 backdrop-blur-sm'
                ]">
          {{ filter.label }}
        </button>
      </div>

      <!-- Innings Selector -->
      <div class="flex gap-2 ml-auto">
        <button v-for="(innings, idx) in match?.innings || []" :key="idx"
                @click="selectedInnings = idx"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                  selectedInnings === idx 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 backdrop-blur-sm'
                ]">
          {{ idx === 0 ? '1st' : '2nd' }} Inn
        </button>
      </div>
    </div>

    <!-- Overs List -->
    <div v-if="filteredOvers.length" class="space-y-4">
      <div v-for="over in filteredOvers" :key="over.overNumber" 
           class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <!-- Over Header -->
        <div class="flex items-center justify-between px-5 py-4 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
             @click="toggleOver(over.overNumber)">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30">
              {{ over.overNumber }}
            </div>
            <div>
              <div class="font-semibold text-white">Over {{ over.overNumber }}</div>
              <div class="text-sm text-slate-400">{{ over.bowler }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="font-bold text-white text-lg">{{ getOverRuns(over) }} runs</span>
              <span v-if="getOverWickets(over)" class="ml-2 text-red-400 font-bold">{{ getOverWickets(over) }}W</span>
            </div>
            <svg :class="['w-5 h-5 text-slate-400 transition-transform duration-300', expandedOvers.includes(over.overNumber) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Over Details -->
        <div v-if="expandedOvers.includes(over.overNumber)" class="border-t border-slate-700/50">
          <div v-for="ball in over.balls" :key="`${over.overNumber}.${ball.ballNumber}`" 
               class="flex items-start gap-4 px-5 py-4 border-b border-slate-700/30 last:border-b-0 transition-colors"
               :class="{
                 'bg-red-500/10': ball.wicket?.how,
                 'bg-amber-500/10': ball.runs === 6,
                 'bg-emerald-500/10': ball.runs === 4
               }">
            <div class="w-14 text-sm font-mono text-slate-500">{{ over.overNumber }}.{{ ball.ballNumber }}</div>
            <div class="w-12 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg"
                 :class="getBallClass(ball)">
              {{ getBallText(ball) }}
            </div>
            <div class="flex-1 text-sm text-slate-300">{{ getCommentary(ball, over) }}</div>
          </div>
          
          <div class="px-5 py-3 bg-slate-900/50 text-center text-sm text-slate-400 border-t border-slate-700/50">
            End of Over {{ over.overNumber }} | <span class="text-white font-medium">{{ getOverRuns(over) }}</span> runs | <span class="text-red-400">{{ getOverWickets(over) }}</span> wickets
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
        <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="font-medium text-slate-400">No ball-by-ball data available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true }
});

const selectedInnings = ref(0);
const activeFilter = ref('all');
const expandedOvers = ref([]);

const filters = [
  { key: 'all', label: 'All Balls' },
  { key: 'boundaries', label: '4s & 6s' },
  { key: 'wickets', label: 'Wickets' }
];

const currentInnings = computed(() => props.match?.innings?.[selectedInnings.value] || null);

const filteredOvers = computed(() => {
  if (!currentInnings.value?.overs) return [];
  const overs = [...currentInnings.value.overs].reverse();
  
  if (activeFilter.value === 'all') return overs;
  
  return overs.map(over => {
    const filteredBalls = over.balls?.filter(ball => {
      if (activeFilter.value === 'boundaries') return ball.runs === 4 || ball.runs === 6;
      if (activeFilter.value === 'wickets') return ball.wicket?.how;
      return true;
    });
    return { ...over, balls: filteredBalls };
  }).filter(over => over.balls?.length > 0);
});

function toggleOver(overNumber) {
  const idx = expandedOvers.value.indexOf(overNumber);
  if (idx > -1) expandedOvers.value.splice(idx, 1);
  else expandedOvers.value.push(overNumber);
}

function getOverRuns(over) {
  // Always calculate from balls if they exist - more reliable
  if (over.balls?.length) {
    return over.balls.reduce((sum, ball) => sum + (ball.runs || 0), 0);
  }
  // Fallback to totalRuns if no balls data
  return over.totalRuns || 0;
}

function getOverWickets(over) {
  // Always calculate from balls if they exist - more reliable
  if (over.balls?.length) {
    return over.balls.filter(ball => ball.wicket?.how).length;
  }
  // Fallback to totalWickets if no balls data
  return over.totalWickets || 0;
}

function getBallClass(ball) {
  if (ball.wicket?.how) return 'bg-gradient-to-br from-red-500 to-red-600 text-white';
  if (ball.runs === 6) return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white';
  if (ball.runs === 4) return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white';
  if (ball.extras !== 'none') return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white';
  return 'bg-slate-700 text-white';
}

function getBallText(ball) {
  if (ball.wicket?.how) return 'W';
  if (ball.extras === 'wide') return `${ball.runs}wd`;
  if (ball.extras === 'no-ball') return `${ball.runs}nb`;
  return ball.runs;
}

function getCommentary(ball, over) {
  const bowler = over.bowler;
  const batsman = ball.batsman;
  
  if (ball.wicket?.how) {
    const w = ball.wicket;
    if (w.how === 'bowled') return `WICKET! ${w.batsman} bowled by ${bowler}`;
    if (w.how === 'caught') return `WICKET! ${w.batsman} caught by ${w.fielder} off ${bowler}`;
    if (w.how === 'lbw') return `WICKET! ${w.batsman} LBW by ${bowler}`;
    if (w.how === 'run out') return `WICKET! ${w.batsman} run out by ${w.fielder}`;
    return `WICKET! ${w.batsman} ${w.how}`;
  }
  
  if (ball.runs === 6) return `SIX! ${batsman} smashes ${bowler} over the boundary`;
  if (ball.runs === 4) return `FOUR! ${batsman} finds the gap`;
  if (ball.runs === 0) return `${bowler} to ${batsman}, no run`;
  if (ball.extras === 'wide') return `Wide ball by ${bowler}`;
  if (ball.extras === 'no-ball') return `No ball by ${bowler}`;
  
  return `${bowler} to ${batsman}, ${ball.runs} run${ball.runs > 1 ? 's' : ''}`;
}
</script>
