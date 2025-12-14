<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <!-- Header -->
    <header class="bg-white/10 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button @click="goBack" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-bold text-white">Match Scorer</h1>
              <p class="text-sm text-blue-200">{{ tournament?.name }} • {{ form.round || 'League Match' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span :class="statusBadgeClass">{{ matchStatus }}</span>
            <button @click="load" :disabled="loading" class="btn-icon">
              <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white/70">Loading match data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-lg mx-auto mt-16 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
      <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="text-lg font-semibold text-white mb-2">Error Loading Match</h3>
      <p class="text-red-200">{{ error }}</p>
      <button @click="load" class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Retry</button>
    </div>

    <!-- Main Content -->
    <main v-else class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Scoreboard -->
      <section class="scoreboard-card">
        <!-- Toss Info Banner -->
        <div v-if="tossInfo" class="text-center py-1.5 mb-3 bg-white/10 rounded-lg border border-white/20">
          <span class="text-sm text-blue-100">🪙 {{ tossInfo }}</span>
        </div>
        
        <div class="flex items-center justify-between mb-4">
          <div class="text-center flex-1">
            <div class="text-lg font-bold text-white">{{ homeTeamName }}</div>
            <div class="text-3xl font-black text-white mt-1">
              {{ getInningsScore(0) }}
            </div>
            <div class="text-sm text-blue-200">{{ getInningsOvers(0) }}</div>
          </div>
          <div class="px-6">
            <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span class="text-2xl font-bold text-white">VS</span>
            </div>
          </div>
          <div class="text-center flex-1">
            <div class="text-lg font-bold text-white">{{ awayTeamName }}</div>
            <div class="text-3xl font-black text-white mt-1">
              {{ getInningsScore(1) }}
            </div>
            <div class="text-sm text-blue-200">{{ getInningsOvers(1) }}</div>
          </div>
        </div>
        
        <!-- Target Info with Required Run Rate -->
        <div v-if="targetInfo" class="text-center py-2 bg-yellow-500/20 rounded-lg">
          <p class="text-yellow-200 font-medium">{{ targetInfo }}</p>
        </div>
        <div v-if="requiredRunRate" class="mt-2 flex justify-center gap-6 text-sm">
          <div class="text-center">
            <div class="text-white/60">Current RR</div>
            <div class="text-lg font-bold text-green-400">{{ currentRunRate }}</div>
          </div>
          <div class="text-center">
            <div class="text-white/60">Required RR</div>
            <div class="text-lg font-bold text-yellow-400">{{ requiredRunRate }}</div>
          </div>
        </div>
      </section>

      <!-- Mode Toggle -->
      <div class="flex justify-center gap-2">
        <button @click="scoringMode = 'ball'" :class="['mode-btn', scoringMode === 'ball' && 'mode-btn-active']">
          🏏 Ball-by-Ball
        </button>
        <button @click="scoringMode = 'scorecard'" :class="['mode-btn', scoringMode === 'scorecard' && 'mode-btn-active']">
          📊 Scorecard Entry
        </button>
      </div>

      <!-- Toss Section -->
      <section v-if="!form.toss.wonBy" class="glass-card p-6">
        <h2 class="text-lg font-bold text-white mb-4">🪙 Toss</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="label">Toss Won By</label>
            <select v-model="form.toss.wonBy" class="input-field" :disabled="finalized">
              <option value="">Select Team</option>
              <option :value="form.homeClub">{{ homeTeamName }}</option>
              <option :value="form.awayClub">{{ awayTeamName }}</option>
            </select>
          </div>
          <div>
            <label class="label">Decision</label>
            <select v-model="form.toss.decision" class="input-field" :disabled="finalized">
              <option value="bat">Bat First</option>
              <option value="bowl">Bowl First</option>
            </select>
          </div>
        </div>
        <p v-if="tossInfo" class="mt-3 text-green-300 text-sm">{{ tossInfo }}</p>
      </section>

      <!-- Innings Tabs -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button v-for="(inn, idx) in form.innings" :key="idx" 
                @click="activeInnings = idx"
                :class="['innings-tab', activeInnings === idx && 'innings-tab-active']">
          <span>Innings {{ idx + 1 }}</span>
          <span class="ml-2 text-xs opacity-70">{{ getInningsScore(idx) }}</span>
        </button>
      </div>

      <!-- Ball-by-Ball Mode -->
      <section v-if="scoringMode === 'ball'" class="grid lg:grid-cols-3 gap-6">
        <!-- Current Players Panel -->
        <div class="glass-card p-5 space-y-4">
          <h3 class="font-bold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Current Players
          </h3>
          
          <!-- Batsmen -->
          <div class="space-y-2">
            <label class="label">Striker</label>
            <select v-model="currentStriker" class="input-field" :disabled="finalized">
              <option value="">Select Striker</option>
              <option v-for="p in availableStrikers" :key="p.playerId" :value="p.playerName"
                      :disabled="p.isOut" :class="{ 'text-red-400 line-through': p.isOut }">
                {{ p.playerName }}{{ p.isOut ? ' (Out)' : '' }}
              </option>
            </select>
            <div v-if="strikerStats" class="text-sm text-blue-200 mt-1">
              {{ strikerStats.runs }} ({{ strikerStats.balls }}) • SR: {{ strikerStats.sr }}
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="label">Non-Striker</label>
            <select v-model="currentNonStriker" class="input-field" :disabled="finalized">
              <option value="">Select Non-Striker</option>
              <option v-for="p in availableNonStrikers" :key="p.playerId" :value="p.playerName"
                      :disabled="p.isOut" :class="{ 'text-red-400 line-through': p.isOut }">
                {{ p.playerName }}{{ p.isOut ? ' (Out)' : '' }}
              </option>
            </select>
            <div v-if="nonStrikerStats" class="text-sm text-blue-200 mt-1">
              {{ nonStrikerStats.runs }} ({{ nonStrikerStats.balls }}) • SR: {{ nonStrikerStats.sr }}
            </div>
          </div>

          <!-- Bowler -->
          <div class="space-y-2 pt-3 border-t border-white/10">
            <label class="label">Bowler</label>
            <select v-model="currentBowler" class="input-field" :disabled="finalized">
              <option value="">Select Bowler</option>
              <option v-for="p in bowlingRoster" :key="p.playerId" :value="p.playerName">{{ p.playerName }}</option>
            </select>
            <div v-if="bowlerStats" class="text-sm text-blue-200 mt-1">
              {{ bowlerStats.overs }}-{{ bowlerStats.maidens }}-{{ bowlerStats.runs }}-{{ bowlerStats.wickets }} • Econ: {{ bowlerStats.econ }}
            </div>
          </div>

          <!-- Partnership -->
          <div class="pt-3 border-t border-white/10">
            <div class="text-sm text-white/60">Partnership</div>
            <div class="text-lg font-bold text-white">{{ partnership.runs }} ({{ partnership.balls }})</div>
          </div>
        </div>

        <!-- Ball Entry Panel -->
        <div class="lg:col-span-2 glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-white">Over {{ currentOver }}.{{ currentBallInOver }}</h3>
            <button @click="undoLastBall" :disabled="!canUndo || finalized" class="btn-sm btn-outline">
              ↩ Undo
            </button>
          </div>

          <!-- Current Over Display -->
          <div class="flex gap-2 mb-6 p-3 bg-white/5 rounded-lg overflow-x-auto">
            <div v-for="(ball, i) in currentOverBalls" :key="i" :class="['ball-indicator', getBallClass(ball)]">
              {{ getBallDisplay(ball) }}
            </div>
            <div v-for="i in (6 - currentOverBalls.length)" :key="'empty-'+i" class="ball-indicator ball-empty">•</div>
          </div>

          <!-- Run Buttons -->
          <div class="mb-4">
            <div class="text-sm text-white/60 mb-2">Runs</div>
            <div class="flex flex-wrap gap-2">
              <button v-for="r in [0,1,2,3,4,5,6]" :key="r" @click="addBall(r, 'none')" 
                      :disabled="finalized"
                      :class="['run-btn', r === 4 && 'run-btn-four', r === 6 && 'run-btn-six']">
                {{ r }}
              </button>
            </div>
          </div>

          <!-- Extras -->
          <div class="mb-4">
            <div class="text-sm text-white/60 mb-2">Extras</div>
            <div class="flex flex-wrap gap-2">
              <button @click="showExtrasModal = true" :disabled="finalized" class="extra-btn">Wide</button>
              <button @click="showNoBallModal = true" :disabled="finalized" class="extra-btn">No Ball</button>
              <button @click="addBall(1, 'bye')" :disabled="finalized" class="extra-btn">Bye</button>
              <button @click="addBall(1, 'legbye')" :disabled="finalized" class="extra-btn">Leg Bye</button>
            </div>
          </div>

          <!-- Wicket -->
          <div>
            <div class="text-sm text-white/60 mb-2">Wicket</div>
            <div class="flex flex-wrap gap-2">
              <button v-for="w in wicketTypes" :key="w" @click="openWicketModal(w)" 
                      :disabled="finalized" class="wicket-btn">
                {{ w }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Scorecard Entry Mode -->
      <section v-if="scoringMode === 'scorecard'" class="space-y-6">
        <!-- Batting Card -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-white">🏏 Batting - {{ getBattingTeamName(activeInnings) }}</h3>
            <button @click="addBatter" :disabled="finalized" class="btn-sm btn-primary">+ Add Batter</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-white/60 border-b border-white/10">
                  <th class="text-left py-2 px-2">Batter</th>
                  <th class="text-center py-2 px-2 w-16">R</th>
                  <th class="text-center py-2 px-2 w-16">B</th>
                  <th class="text-center py-2 px-2 w-12">4s</th>
                  <th class="text-center py-2 px-2 w-12">6s</th>
                  <th class="text-left py-2 px-2">Dismissal</th>
                  <th class="text-center py-2 px-2 w-16">SR</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bat, i) in currentInnings.battingCard" :key="i" class="border-b border-white/5">
                  <td class="py-2 px-2">
                    <select v-model="bat.playerName" class="input-sm" :disabled="finalized">
                      <option value="">Select</option>
                      <option v-for="p in battingRoster" :key="p.playerId" :value="p.playerName">{{ p.playerName }}</option>
                    </select>
                  </td>
                  <td class="py-2 px-2"><input v-model.number="bat.runs" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2"><input v-model.number="bat.balls" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2"><input v-model.number="bat.fours" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2"><input v-model.number="bat.sixes" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2">
                    <select v-model="bat.dismissalHow" class="input-sm" :disabled="finalized">
                      <option value="">Not Out</option>
                      <option v-for="d in dismissalTypes" :key="d" :value="d">{{ d }}</option>
                    </select>
                  </td>
                  <td class="py-2 px-2 text-center text-white/70">{{ calcSR(bat.runs, bat.balls) }}</td>
                  <td class="py-2 px-2">
                    <button @click="removeBatter(i)" :disabled="finalized" class="text-red-400 hover:text-red-300">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Extras Row -->
          <div class="mt-4 pt-4 border-t border-white/10">
            <div class="text-sm text-white/60 mb-2">Extras</div>
            <div class="flex flex-wrap gap-4">
              <div><label class="text-xs text-white/50">Wides</label><input v-model.number="currentInnings.extras.wides" type="number" min="0" class="input-num ml-2" :disabled="finalized"/></div>
              <div><label class="text-xs text-white/50">No Balls</label><input v-model.number="currentInnings.extras.noBalls" type="number" min="0" class="input-num ml-2" :disabled="finalized"/></div>
              <div><label class="text-xs text-white/50">Byes</label><input v-model.number="currentInnings.extras.byes" type="number" min="0" class="input-num ml-2" :disabled="finalized"/></div>
              <div><label class="text-xs text-white/50">Leg Byes</label><input v-model.number="currentInnings.extras.legByes" type="number" min="0" class="input-num ml-2" :disabled="finalized"/></div>
            </div>
          </div>
        </div>

        <!-- Bowling Card -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-white">🎯 Bowling - {{ getBowlingTeamName(activeInnings) }}</h3>
            <button @click="addBowler" :disabled="finalized" class="btn-sm btn-primary">+ Add Bowler</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-white/60 border-b border-white/10">
                  <th class="text-left py-2 px-2">Bowler</th>
                  <th class="text-center py-2 px-2 w-16">O</th>
                  <th class="text-center py-2 px-2 w-12">M</th>
                  <th class="text-center py-2 px-2 w-16">R</th>
                  <th class="text-center py-2 px-2 w-12">W</th>
                  <th class="text-center py-2 px-2 w-16">Econ</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bowl, i) in currentInnings.bowlingCard" :key="i" class="border-b border-white/5">
                  <td class="py-2 px-2">
                    <select v-model="bowl.bowlerName" class="input-sm" :disabled="finalized">
                      <option value="">Select</option>
                      <option v-for="p in bowlingRoster" :key="p.playerId" :value="p.playerName">{{ p.playerName }}</option>
                    </select>
                  </td>
                  <td class="py-2 px-2"><input v-model.number="bowl.overs" type="number" min="0" step="0.1" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2"><input v-model.number="bowl.maidens" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2"><input v-model.number="bowl.runs" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2"><input v-model.number="bowl.wickets" type="number" min="0" class="input-num" :disabled="finalized"/></td>
                  <td class="py-2 px-2 text-center text-white/70">{{ calcEcon(bowl.runs, bowl.overs) }}</td>
                  <td class="py-2 px-2">
                    <button @click="removeBowler(i)" :disabled="finalized" class="text-red-400 hover:text-red-300">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Summary Section -->
      <section class="glass-card p-5">
        <h3 class="font-bold text-white mb-4">🏆 Match Summary</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="label">Player of the Match</label>
            <input v-model="form.summary.playerOfTheMatch" class="input-field" placeholder="Enter name" :disabled="finalized"/>
          </div>
          <div>
            <label class="label">Top Scorer</label>
            <input v-model="form.summary.topScorer" class="input-field" :placeholder="autoTopScorer" :disabled="finalized"/>
          </div>
        </div>
      </section>

      <!-- Action Bar -->
      <div class="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-white/10 -mx-4 px-4 py-4">
        <div class="flex items-center justify-between max-w-7xl mx-auto">
          <div class="text-sm text-white/60">
            <span v-if="saving" class="text-yellow-400">Saving...</span>
            <span v-else-if="lastSaved">Last saved: {{ lastSaved }}</span>
          </div>
          <div class="flex gap-3">
            <button @click="save" :disabled="saving || finalized" class="btn btn-primary">
              💾 Save
            </button>
            <button v-if="!finalized" @click="showFinalizeModal = true" :disabled="saving" class="btn btn-success">
              ✓ Finalize
            </button>
            <button v-else @click="unlockMatch" :disabled="saving" class="btn btn-warning">
              🔓 Unlock
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Wicket Modal -->
    <Teleport to="body">
      <div v-if="showWicketModal" class="modal-overlay" @click.self="showWicketModal = false">
        <div class="modal-content">
          <h3 class="text-lg font-bold text-white mb-4">Wicket Details</h3>
          <div class="space-y-4">
            <div>
              <label class="label">Batsman Out</label>
              <select v-model="wicketForm.batsman" class="input-field">
                <option :value="currentStriker">{{ currentStriker }} (Striker)</option>
                <option :value="currentNonStriker">{{ currentNonStriker }} (Non-Striker)</option>
              </select>
            </div>
            <div>
              <label class="label">How Out</label>
              <input :value="wicketForm.how" class="input-field bg-white/5" disabled/>
            </div>
            <div v-if="needsFielder">
              <label class="label">Fielder</label>
              <select v-model="wicketForm.fielder" class="input-field">
                <option value="">Select Fielder</option>
                <option v-for="p in bowlingRoster" :key="p.playerId" :value="p.playerName">{{ p.playerName }}</option>
              </select>
            </div>
            <div>
              <label class="label">Runs on this ball</label>
              <input v-model.number="wicketForm.runs" type="number" min="0" max="6" class="input-field"/>
            </div>
            <label class="flex items-center gap-2 text-white/80">
              <input type="checkbox" v-model="wicketForm.crossed" class="rounded"/>
              Batsmen crossed before wicket
            </label>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showWicketModal = false" class="btn btn-outline">Cancel</button>
            <button @click="confirmWicket" class="btn btn-danger">Confirm Wicket</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Finalize Modal -->
    <Teleport to="body">
      <div v-if="showFinalizeModal" class="modal-overlay" @click.self="showFinalizeModal = false">
        <div class="modal-content">
          <h3 class="text-lg font-bold text-white mb-4">Finalize Match</h3>
          <p class="text-white/70 mb-4">This will compute the winner and lock the match. Are you sure?</p>
          <div class="space-y-3 mb-4">
            <label class="flex items-center gap-2 text-white/80">
              <input type="checkbox" v-model="finalizeForm.noResult" class="rounded"/>
              Mark as No Result
            </label>
            <label class="flex items-center gap-2 text-white/80">
              <input type="checkbox" v-model="finalizeForm.cancelled" class="rounded"/>
              Mark as Cancelled
            </label>
            <div v-if="finalizeForm.noResult || finalizeForm.cancelled">
              <label class="label">Reason</label>
              <input v-model="finalizeForm.reason" class="input-field" placeholder="e.g., Rain, Ground unplayable"/>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showFinalizeModal = false" class="btn btn-outline">Cancel</button>
            <button @click="finalize" class="btn btn-success">Finalize Match</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Extras Modal -->
    <Teleport to="body">
      <div v-if="showExtrasModal" class="modal-overlay" @click.self="showExtrasModal = false">
        <div class="modal-content">
          <h3 class="text-lg font-bold text-white mb-4">Wide Ball</h3>
          <div class="space-y-4">
            <div>
              <label class="label">Extra Runs (in addition to 1 wide)</label>
              <div class="flex gap-2">
                <button v-for="r in [0,1,2,3,4]" :key="r" @click="addBall(1 + r, 'wide'); showExtrasModal = false" class="run-btn">+{{ r }}</button>
              </div>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button @click="showExtrasModal = false" class="btn btn-outline">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- No Ball Modal -->
    <Teleport to="body">
      <div v-if="showNoBallModal" class="modal-overlay" @click.self="showNoBallModal = false">
        <div class="modal-content">
          <h3 class="text-lg font-bold text-white mb-4">No Ball</h3>
          <div class="space-y-4">
            <div>
              <label class="label">Runs off the bat (in addition to 1 no ball)</label>
              <div class="flex gap-2">
                <button v-for="r in [0,1,2,3,4,6]" :key="r" @click="addBall(1 + r, 'noball'); showNoBallModal = false" class="run-btn">+{{ r }}</button>
              </div>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button @click="showNoBallModal = false" class="btn btn-outline">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/api';
import { notify } from '../utils/notifications';

// Route params
const route = useRoute();
const router = useRouter();
const tournamentId = route.params.id;
const matchId = route.params.matchId;

// State
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const finalized = ref(false);
const match = ref(null);
const tournament = ref(null);
const scoringMode = ref('ball');
const activeInnings = ref(0);
const lastSaved = ref('');

// Modals
const showWicketModal = ref(false);
const showFinalizeModal = ref(false);
const showExtrasModal = ref(false);
const showNoBallModal = ref(false);

// Current players for ball-by-ball mode
const currentStriker = ref('');
const currentNonStriker = ref('');
const currentBowler = ref('');

// Ball history for undo
const ballHistory = ref([]);

// Form data
const form = reactive({
  homeClub: '',
  awayClub: '',
  homeName: '',
  awayName: '',
  date: '',
  time: '',
  venue: '',
  round: '',
  toss: { wonBy: '', decision: 'bat' },
  innings: [createEmptyInnings(), createEmptyInnings()],
  summary: { playerOfTheMatch: '', topScorer: '', topWicketTaker: '' }
});

const wicketForm = reactive({
  batsman: '',
  how: '',
  fielder: '',
  bowler: '',
  runs: 0,
  crossed: false
});

const finalizeForm = reactive({
  noResult: false,
  cancelled: false,
  reason: ''
});

const rosterData = ref({
  homeClub: { players: [] },
  awayClub: { players: [] }
});

// Constants
const wicketTypes = ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'];
const dismissalTypes = ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Retired Out'];

// Helper Functions
function createEmptyInnings() {
  return {
    battingClub: '',
    bowlingClub: '',
    battingCard: [],
    bowlingCard: [],
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 },
    overs: [],
    totalRuns: 0,
    totalWickets: 0,
    totalBalls: 0
  };
}

function goBack() {
  router.back();
}

// Computed Properties
const homeTeamName = computed(() => form.homeName || 'Home Team');
const awayTeamName = computed(() => form.awayName || 'Away Team');

const matchStatus = computed(() => {
  if (finalized.value) return 'Completed';
  if (form.innings.some(i => i.totalBalls > 0)) return 'Live';
  return 'Scheduled';
});

const statusBadgeClass = computed(() => {
  const base = 'px-3 py-1 rounded-full text-xs font-bold';
  switch (matchStatus.value) {
    case 'Live': return `${base} bg-red-500 text-white animate-pulse`;
    case 'Completed': return `${base} bg-green-500 text-white`;
    default: return `${base} bg-blue-500 text-white`;
  }
});

const currentInnings = computed(() => form.innings[activeInnings.value] || createEmptyInnings());

const battingRoster = computed(() => {
  const battingClub = currentInnings.value.battingClub;
  if (battingClub === form.homeClub) return rosterData.value.homeClub.players || [];
  if (battingClub === form.awayClub) return rosterData.value.awayClub.players || [];
  return [];
});

// Get list of dismissed batsmen names
const dismissedBatsmen = computed(() => {
  const battingCard = currentInnings.value.battingCard || [];
  return battingCard
    .filter(b => b.dismissalHow && b.dismissalHow !== '' && b.dismissalHow !== 'Not Out')
    .map(b => b.playerName);
});

// Available batsmen for striker (excludes out players and current non-striker)
const availableStrikers = computed(() => {
  return battingRoster.value.map(p => ({
    ...p,
    isOut: dismissedBatsmen.value.includes(p.playerName),
    isOther: p.playerName === currentNonStriker.value
  })).filter(p => !p.isOther); // Don't show currently selected non-striker
});

// Available batsmen for non-striker (excludes out players and current striker)
const availableNonStrikers = computed(() => {
  return battingRoster.value.map(p => ({
    ...p,
    isOut: dismissedBatsmen.value.includes(p.playerName),
    isOther: p.playerName === currentStriker.value
  })).filter(p => !p.isOther); // Don't show currently selected striker
});

const bowlingRoster = computed(() => {
  const bowlingClub = currentInnings.value.bowlingClub;
  if (bowlingClub === form.homeClub) return rosterData.value.homeClub.players || [];
  if (bowlingClub === form.awayClub) return rosterData.value.awayClub.players || [];
  return [];
});

const tossInfo = computed(() => {
  if (!form.toss.wonBy) return '';
  const winner = form.toss.wonBy === form.homeClub ? homeTeamName.value : awayTeamName.value;
  return `${winner} won the toss and chose to ${form.toss.decision}`;
});

const currentOver = computed(() => Math.floor(currentInnings.value.totalBalls / 6) + 1);
const currentBallInOver = computed(() => currentInnings.value.totalBalls % 6);

const currentOverBalls = computed(() => {
  const overs = currentInnings.value.overs || [];
  const lastOver = overs.find(o => o.overNumber === currentOver.value);
  return lastOver?.balls || [];
});

const canUndo = computed(() => ballHistory.value.length > 0);

const needsFielder = computed(() => ['Caught', 'Run Out', 'Stumped'].includes(wicketForm.how));

const strikerStats = computed(() => {
  if (!currentStriker.value) return null;
  const bat = currentInnings.value.battingCard.find(b => b.playerName === currentStriker.value);
  if (!bat) return null;
  return {
    runs: bat.runs || 0,
    balls: bat.balls || 0,
    sr: calcSR(bat.runs, bat.balls)
  };
});

const nonStrikerStats = computed(() => {
  if (!currentNonStriker.value) return null;
  const bat = currentInnings.value.battingCard.find(b => b.playerName === currentNonStriker.value);
  if (!bat) return null;
  return {
    runs: bat.runs || 0,
    balls: bat.balls || 0,
    sr: calcSR(bat.runs, bat.balls)
  };
});

const bowlerStats = computed(() => {
  if (!currentBowler.value) return null;
  const bowl = currentInnings.value.bowlingCard.find(b => b.bowlerName === currentBowler.value);
  if (!bowl) return null;
  const balls = bowl.balls || 0;
  return {
    overs: `${Math.floor(balls/6)}.${balls%6}`,
    maidens: bowl.maidens || 0,
    runs: bowl.runs || 0,
    wickets: bowl.wickets || 0,
    econ: calcEcon(bowl.runs, balls/6)
  };
});

const partnership = computed(() => {
  // Calculate from last wicket
  return { runs: 0, balls: 0 }; // Simplified for now
});

const targetInfo = computed(() => {
  if (activeInnings.value === 0) return '';
  const firstInnings = form.innings[0];
  const secondInnings = form.innings[1];
  if (!firstInnings.totalRuns) return '';
  
  const target = firstInnings.totalRuns + 1;
  const needed = target - secondInnings.totalRuns;
  const ballsLeft = (tournament.value?.oversLimit || 20) * 6 - secondInnings.totalBalls;
  
  if (needed <= 0) return `${getBattingTeamName(1)} won by ${10 - secondInnings.totalWickets} wickets!`;
  if (secondInnings.totalWickets >= 10) return `${getBattingTeamName(0)} won by ${needed - 1} runs!`;
  if (ballsLeft <= 0) return `${getBattingTeamName(0)} won by ${needed - 1} runs!`;
  
  return `${getBattingTeamName(1)} need ${needed} runs from ${ballsLeft} balls (Target: ${target})`;
});

// Current run rate (for batting team in current innings)
const currentRunRate = computed(() => {
  const inn = form.innings[activeInnings.value];
  if (!inn || !inn.totalBalls) return '0.00';
  const overs = inn.totalBalls / 6;
  return (inn.totalRuns / overs).toFixed(2);
});

// Required run rate (only for 2nd innings)
const requiredRunRate = computed(() => {
  if (activeInnings.value === 0) return '';
  const firstInnings = form.innings[0];
  const secondInnings = form.innings[1];
  if (!firstInnings.totalRuns) return '';
  
  const target = firstInnings.totalRuns + 1;
  const needed = target - secondInnings.totalRuns;
  const ballsLeft = (tournament.value?.oversLimit || 20) * 6 - secondInnings.totalBalls;
  
  if (needed <= 0 || ballsLeft <= 0) return '';
  
  const oversLeft = ballsLeft / 6;
  return (needed / oversLeft).toFixed(2);
});

const autoTopScorer = computed(() => {
  const allBatters = [...form.innings[0].battingCard, ...form.innings[1].battingCard];
  const top = allBatters.sort((a, b) => (b.runs || 0) - (a.runs || 0))[0];
  return top ? `${top.playerName} - ${top.runs}(${top.balls})` : '';
});

// Methods
function getInningsScore(idx) {
  const inn = form.innings[idx];
  if (!inn) return '-';
  const runs = inn.totalRuns || calcInningsTotal(inn);
  const wickets = inn.totalWickets || calcInningsWickets(inn);
  return `${runs}/${wickets}`;
}

function getInningsOvers(idx) {
  const inn = form.innings[idx];
  if (!inn) return '';
  const balls = inn.totalBalls || 0;
  return `(${Math.floor(balls/6)}.${balls%6} ov)`;
}

function getBattingTeamName(idx) {
  const battingClub = form.innings[idx]?.battingClub;
  if (battingClub === form.homeClub) return homeTeamName.value;
  if (battingClub === form.awayClub) return awayTeamName.value;
  return 'Team';
}

function getBowlingTeamName(idx) {
  const bowlingClub = form.innings[idx]?.bowlingClub;
  if (bowlingClub === form.homeClub) return homeTeamName.value;
  if (bowlingClub === form.awayClub) return awayTeamName.value;
  return 'Team';
}

function calcInningsTotal(inn) {
  const batRuns = (inn.battingCard || []).reduce((s, b) => s + (b.runs || 0), 0);
  const ex = inn.extras || {};
  return batRuns + (ex.wides || 0) + (ex.noBalls || 0) + (ex.byes || 0) + (ex.legByes || 0);
}

function calcInningsWickets(inn) {
  return (inn.battingCard || []).filter(b => b.dismissalHow && b.dismissalHow !== 'Not Out').length;
}

function calcSR(runs, balls) {
  if (!balls) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
}

function calcEcon(runs, overs) {
  if (!overs) return '0.00';
  return (runs / overs).toFixed(2);
}

function getBallClass(ball) {
  if (ball.wicket) return 'ball-wicket';
  if (ball.runs === 4) return 'ball-four';
  if (ball.runs === 6) return 'ball-six';
  if (ball.extras && ball.extras !== 'none') return 'ball-extra';
  if (ball.runs === 0) return 'ball-dot';
  return 'ball-run';
}

function getBallDisplay(ball) {
  if (ball.wicket) return 'W';
  if (ball.extras === 'wide') return `${ball.runs}wd`;
  if (ball.extras === 'noball') return `${ball.runs}nb`;
  if (ball.extras === 'bye') return `${ball.runs}b`;
  if (ball.extras === 'legbye') return `${ball.runs}lb`;
  return ball.runs;
}

// Ball-by-ball logic
function addBall(runs, extras = 'none', wicket = null) {
  if (finalized.value) return;
  if (!currentStriker.value || !currentBowler.value) {
    notify.error('Please select striker and bowler');
    return;
  }

  const inn = form.innings[activeInnings.value];
  const isLegalDelivery = extras !== 'wide' && extras !== 'noball';
  
  // Create ball record
  const ball = {
    overNumber: currentOver.value,
    ballNumber: currentBallInOver.value + 1,
    runs,
    extras,
    wicket,
    batsman: currentStriker.value,
    bowler: currentBowler.value
  };

  // Save for undo
  ballHistory.value.push({
    inningsIdx: activeInnings.value,
    ball,
    striker: currentStriker.value,
    nonStriker: currentNonStriker.value
  });

  // Update over structure
  let overObj = inn.overs.find(o => o.overNumber === currentOver.value);
  if (!overObj) {
    overObj = { overNumber: currentOver.value, bowler: currentBowler.value, balls: [] };
    inn.overs.push(overObj);
  }
  overObj.balls.push(ball);

  // Update totals
  inn.totalRuns = (inn.totalRuns || 0) + runs;
  if (isLegalDelivery) {
    inn.totalBalls = (inn.totalBalls || 0) + 1;
  }

  // Update extras
  if (extras === 'wide') inn.extras.wides += runs;
  else if (extras === 'noball') inn.extras.noBalls += runs;
  else if (extras === 'bye') inn.extras.byes += runs;
  else if (extras === 'legbye') inn.extras.legByes += runs;

  // Update batsman stats (only for legal deliveries and bat runs)
  if (extras === 'none' || extras === 'noball') {
    updateBatsmanStats(currentStriker.value, extras === 'none' ? runs : runs - 1, isLegalDelivery);
  }

  // Update bowler stats
  updateBowlerStats(currentBowler.value, runs, isLegalDelivery, !!wicket);

  // Handle wicket
  if (wicket) {
    inn.totalWickets = (inn.totalWickets || 0) + 1;
    markBatsmanOut(wicket.batsman, wicket.how, wicket.fielder, currentBowler.value);
  }

  // Strike rotation
  handleStrikeRotation(runs, extras, wicket);

  // Check if innings is complete (overs finished or all out)
  checkInningsComplete();

  // Auto-save
  debouncedSave();
}

// Check if current innings is complete and auto-switch to next innings
function checkInningsComplete() {
  const inn = form.innings[activeInnings.value];
  const maxBalls = (tournament.value?.oversLimit || 20) * 6;
  const isAllOut = inn.totalWickets >= 10;
  const isOversComplete = inn.totalBalls >= maxBalls;
  
  if (isAllOut || isOversComplete) {
    if (activeInnings.value === 0) {
      // Switch to 2nd innings
      notify.success(`1st Innings Complete! Score: ${inn.totalRuns}/${inn.totalWickets}`);
      activeInnings.value = 1;
      
      // Clear current batsmen and bowler for new innings
      currentStriker.value = '';
      currentNonStriker.value = '';
      currentBowler.value = '';
      
      // Show target notification
      const target = inn.totalRuns + 1;
      setTimeout(() => {
        notify.info(`Target: ${target} runs`);
      }, 1000);
    } else {
      // Match complete - 2nd innings ended
      const firstInningsRuns = form.innings[0].totalRuns;
      const secondInningsRuns = inn.totalRuns;
      
      if (secondInningsRuns >= firstInningsRuns + 1) {
        notify.success(`${getBattingTeamName(1)} won!`);
      } else {
        notify.success(`${getBattingTeamName(0)} won by ${firstInningsRuns - secondInningsRuns} runs!`);
      }
    }
  }
}

function updateBatsmanStats(name, runs, countBall) {
  const inn = form.innings[activeInnings.value];
  let bat = inn.battingCard.find(b => b.playerName === name);
  if (!bat) {
    bat = { playerName: name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissalHow: '' };
    inn.battingCard.push(bat);
  }
  bat.runs = (bat.runs || 0) + runs;
  if (countBall) bat.balls = (bat.balls || 0) + 1;
  if (runs === 4) bat.fours = (bat.fours || 0) + 1;
  if (runs === 6) bat.sixes = (bat.sixes || 0) + 1;
}

function updateBowlerStats(name, runs, isLegalDelivery, gotWicket) {
  const inn = form.innings[activeInnings.value];
  let bowl = inn.bowlingCard.find(b => b.bowlerName === name);
  if (!bowl) {
    bowl = { bowlerName: name, balls: 0, maidens: 0, runs: 0, wickets: 0 };
    inn.bowlingCard.push(bowl);
  }
  bowl.runs = (bowl.runs || 0) + runs;
  if (isLegalDelivery) bowl.balls = (bowl.balls || 0) + 1;
  if (gotWicket) bowl.wickets = (bowl.wickets || 0) + 1;
}

function markBatsmanOut(name, how, fielder, bowler) {
  const inn = form.innings[activeInnings.value];
  let bat = inn.battingCard.find(b => b.playerName === name);
  if (!bat) {
    bat = { playerName: name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissalHow: '' };
    inn.battingCard.push(bat);
  }
  bat.dismissalHow = how;
  bat.dismissalFielder = fielder;
  bat.dismissalBowler = bowler;
}

function handleStrikeRotation(runs, extras, wicket) {
  const oddRuns = runs % 2 === 1;
  const endOfOver = currentInnings.value.totalBalls % 6 === 0 && extras !== 'wide' && extras !== 'noball';

  // Wicket handling
  if (wicket) {
    // New batsman needed - for now just show notification
    notify.info('Select new batsman');
    if (wicket.crossed) {
      // Striker becomes current non-striker's position
    }
    return;
  }

  // Normal rotation
  if (oddRuns || endOfOver) {
    const temp = currentStriker.value;
    currentStriker.value = currentNonStriker.value;
    currentNonStriker.value = temp;
  }
}

function openWicketModal(how) {
  wicketForm.batsman = currentStriker.value;
  wicketForm.how = how;
  wicketForm.fielder = '';
  wicketForm.bowler = currentBowler.value;
  wicketForm.runs = 0;
  wicketForm.crossed = false;
  showWicketModal.value = true;
}

function confirmWicket() {
  const wicket = {
    batsman: wicketForm.batsman,
    how: wicketForm.how,
    fielder: wicketForm.fielder,
    bowler: wicketForm.bowler,
    crossed: wicketForm.crossed
  };
  addBall(wicketForm.runs, 'none', wicket);
  showWicketModal.value = false;
}

function undoLastBall() {
  if (!canUndo.value) return;
  const last = ballHistory.value.pop();
  if (!last) return;
  
  const inn = form.innings[last.inningsIdx];
  const overObj = inn.overs.find(o => o.overNumber === last.ball.overNumber);
  if (overObj) {
    overObj.balls.pop();
    if (overObj.balls.length === 0) {
      inn.overs = inn.overs.filter(o => o !== overObj);
    }
  }

  // Reverse totals
  inn.totalRuns -= last.ball.runs;
  if (last.ball.extras !== 'wide' && last.ball.extras !== 'noball') {
    inn.totalBalls -= 1;
  }
  if (last.ball.wicket) {
    inn.totalWickets -= 1;
  }

  // Restore players
  currentStriker.value = last.striker;
  currentNonStriker.value = last.nonStriker;

  notify.success('Ball undone');
}

// Scorecard mode helpers
function addBatter() {
  currentInnings.value.battingCard.push({
    playerName: '',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    dismissalHow: ''
  });
}

function removeBatter(idx) {
  currentInnings.value.battingCard.splice(idx, 1);
}

function addBowler() {
  currentInnings.value.bowlingCard.push({
    bowlerName: '',
    overs: 0,
    maidens: 0,
    runs: 0,
    wickets: 0
  });
}

function removeBowler(idx) {
  currentInnings.value.bowlingCard.splice(idx, 1);
}

// API calls
async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [tRes, mRes] = await Promise.all([
      api.get(`/tournaments/${tournamentId}`),
      api.get(`/tournaments/${tournamentId}/matches/${matchId}`)
    ]);
    
    tournament.value = tRes.data;
    match.value = mRes.data;
    finalized.value = mRes.data.finalized || mRes.data.status === 'Completed';

    // Populate form
    form.homeClub = mRes.data.homeClub?._id || mRes.data.homeClub || '';
    form.awayClub = mRes.data.awayClub?._id || mRes.data.awayClub || '';
    form.homeName = mRes.data.teams?.home?.name || mRes.data.homeClub?.clubName || 'Home';
    form.awayName = mRes.data.teams?.away?.name || mRes.data.awayClub?.clubName || 'Away';
    form.date = mRes.data.date?.slice(0, 10) || '';
    form.time = mRes.data.time || '';
    form.venue = mRes.data.venue || '';
    form.round = mRes.data.round || '';

    if (mRes.data.toss) {
      form.toss.wonBy = mRes.data.toss.wonBy?._id || mRes.data.toss.wonBy || '';
      form.toss.decision = mRes.data.toss.decision || 'bat';
    }

    if (mRes.data.innings?.length) {
      form.innings = mRes.data.innings.map(mapInningsFromAPI);
    }

    if (mRes.data.summary) {
      form.summary = { ...mRes.data.summary };
    }

    // Load rosters
    rosterData.value = {
      homeClub: { players: mRes.data.homeClubRoster?.players || [] },
      awayClub: { players: mRes.data.awayClubRoster?.players || [] }
    };

  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load';
  } finally {
    loading.value = false;
  }
}

function mapInningsFromAPI(inn) {
  return {
    battingClub: inn.battingClub?._id || inn.battingClub || '',
    bowlingClub: inn.bowlingClub?._id || inn.bowlingClub || '',
    battingCard: (inn.battingCard || []).map(b => ({
      playerName: b.playerName || '',
      runs: b.runs || 0,
      balls: b.balls || 0,
      fours: b.fours || 0,
      sixes: b.sixes || 0,
      dismissalHow: b.dismissal?.how || b.dismissalHow || '',
      dismissalFielder: b.dismissal?.fielder || b.dismissalFielder || '',
      dismissalBowler: b.dismissal?.bowler || b.dismissalBowler || ''
    })),
    bowlingCard: (inn.bowlingCard || []).map(b => ({
      bowlerName: b.bowlerName || '',
      balls: b.balls || 0,
      overs: b.balls ? b.balls / 6 : 0,
      maidens: b.maidens || 0,
      runs: b.runs || 0,
      wickets: b.wickets || 0
    })),
    extras: {
      wides: inn.extras?.wides || 0,
      noBalls: inn.extras?.noBalls || 0,
      byes: inn.extras?.byes || 0,
      legByes: inn.extras?.legByes || 0,
      penalty: inn.extras?.penalty || 0
    },
    overs: inn.overs || [],
    totalRuns: inn.totalRuns || inn.runs || 0,
    totalWickets: inn.totalWickets || inn.wickets || 0,
    totalBalls: inn.totalBalls || inn.balls || 0
  };
}

let saveTimeout = null;
function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => save(), 2000);
}

async function save() {
  if (saving.value || finalized.value) return;
  saving.value = true;
  try {
    // Recalculate totals before saving
    form.innings.forEach(inn => {
      inn.totalRuns = calcInningsTotal(inn);
      inn.totalWickets = calcInningsWickets(inn);
    });

    await api.put(`/admin/tournaments/${tournamentId}/matches/${matchId}/details`, {
      date: form.date,
      time: form.time,
      venue: form.venue,
      toss: form.toss,
      innings: form.innings,
      summary: form.summary
    });
    lastSaved.value = new Date().toLocaleTimeString();
    notify.success('Saved');
  } catch (e) {
    notify.error(e.response?.data?.message || 'Failed to save');
  } finally {
    saving.value = false;
  }
}

async function finalize() {
  saving.value = true;
  try {
    await api.put(`/admin/tournaments/${tournamentId}/matches/${matchId}/finalize`, {
      noResult: finalizeForm.noResult,
      cancelled: finalizeForm.cancelled,
      reason: finalizeForm.reason
    });
    notify.success('Match finalized');
    showFinalizeModal.value = false;
    await load();
  } catch (e) {
    notify.error(e.response?.data?.message || 'Failed to finalize');
  } finally {
    saving.value = false;
  }
}

async function unlockMatch() {
  saving.value = true;
  try {
    await api.put(`/admin/tournaments/${tournamentId}/matches/${matchId}/unfinalize`);
    notify.success('Match unlocked');
    await load();
  } catch (e) {
    notify.error(e.response?.data?.message || 'Failed to unlock');
  } finally {
    saving.value = false;
  }
}

// Watch toss to set innings order
watch(() => [form.toss.wonBy, form.toss.decision], ([wonBy, decision]) => {
  if (!wonBy || !form.homeClub || !form.awayClub) return;
  
  const tossWinner = wonBy;
  const tossLoser = wonBy === form.homeClub ? form.awayClub : form.homeClub;
  
  if (decision === 'bat') {
    form.innings[0].battingClub = tossWinner;
    form.innings[0].bowlingClub = tossLoser;
    form.innings[1].battingClub = tossLoser;
    form.innings[1].bowlingClub = tossWinner;
  } else {
    form.innings[0].battingClub = tossLoser;
    form.innings[0].bowlingClub = tossWinner;
    form.innings[1].battingClub = tossWinner;
    form.innings[1].bowlingClub = tossLoser;
  }
});

// Restore batsmen from last over when page loads or innings changes
function restoreBatsmenFromLastOver() {
  const inn = form.innings[activeInnings.value];
  if (!inn || !inn.overs || inn.overs.length === 0) return;
  
  // Get all balls across all overs, sorted by over and ball number
  const allBalls = [];
  for (const over of inn.overs) {
    for (const ball of (over.balls || [])) {
      allBalls.push({ ...ball, overNumber: over.overNumber });
    }
  }
  
  if (allBalls.length === 0) return;
  
  // Get the last ball
  const lastBall = allBalls[allBalls.length - 1];
  const lastBatsman = lastBall.batsman;
  
  // Find the other batsman who's currently at crease (not out)
  const notOutBatsmen = inn.battingCard
    .filter(b => !b.dismissalHow || b.dismissalHow === '' || b.dismissalHow === 'Not Out')
    .map(b => b.playerName);
  
  if (notOutBatsmen.length === 0) return;
  
  // The last ball's batsman was the striker
  let striker = lastBatsman;
  let nonStriker = notOutBatsmen.find(b => b !== striker) || '';
  
  // Check if we need to swap due to odd runs or end of over
  const lastBallRuns = lastBall.runs || 0;
  const lastBallExtras = lastBall.extras || 'none';
  const isLegalDelivery = lastBallExtras !== 'wide' && lastBallExtras !== 'noball';
  
  // Count legal deliveries in the current over to check if we're at the start of a new over
  const legalBallsInLastOver = (inn.overs.find(o => o.overNumber === lastBall.overNumber)?.balls || [])
    .filter(b => b.extras !== 'wide' && b.extras !== 'noball').length;
  
  const endedOnOverComplete = legalBallsInLastOver === 6;
  const oddRuns = lastBallRuns % 2 === 1;
  
  // If last ball ended the over (6 legal deliveries), striker and non-striker need to swap for new over
  // If odd runs were scored on last ball, they already swapped
  // Net effect: if over ended on odd runs, no swap needed; if over ended on even runs, swap needed
  if (endedOnOverComplete) {
    if (!oddRuns) {
      // Swap for new over (odd runs already caused a swap, so even runs means we swap now)
      const temp = striker;
      striker = nonStriker;
      nonStriker = temp;
    }
    // If odd runs, the addBall already swapped them, and end of over would swap again,
    // but since we're restoring from the state AFTER the ball, they appear in swapped state
  } else if (oddRuns) {
    // Mid-over odd runs means striker and non-striker are already swapped in the saved state
    // No action needed here
  }
  
  // Set the values
  if (striker && notOutBatsmen.includes(striker)) {
    currentStriker.value = striker;
  }
  if (nonStriker && notOutBatsmen.includes(nonStriker)) {
    currentNonStriker.value = nonStriker;
  }
  
  // Also restore the bowler from the last over
  const currentOverNum = Math.floor(inn.totalBalls / 6) + 1;
  const currentOverObj = inn.overs.find(o => o.overNumber === currentOverNum);
  if (currentOverObj && currentOverObj.bowler) {
    currentBowler.value = currentOverObj.bowler;
  }
}

// Watch activeInnings to restore batsmen when switching innings
watch(activeInnings, () => {
  restoreBatsmenFromLastOver();
});

onMounted(async () => {
  await load();
  // Restore batsmen after data is loaded
  restoreBatsmenFromLastOver();
});
</script>

<style scoped>
/* Base styles */
.label { @apply block text-sm text-white/60 mb-1; }
.input-field { @apply w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500; }
.input-sm { @apply bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm w-full; }
.input-num { @apply bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-center w-16; }

/* Cards */
.glass-card { @apply bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl; }
.scoreboard-card { @apply bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6; }

/* Buttons */
.btn { @apply px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50; }
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
.btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
.btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
.btn-warning { @apply bg-yellow-600 text-white hover:bg-yellow-700; }
.btn-outline { @apply border border-white/30 text-white hover:bg-white/10; }
.btn-sm { @apply px-3 py-1.5 text-sm rounded-lg; }
.btn-icon { @apply p-2 hover:bg-white/10 rounded-lg text-white transition-colors; }

/* Mode toggle */
.mode-btn { @apply px-4 py-2 rounded-full text-sm font-medium text-white/70 bg-white/10 hover:bg-white/20 transition-all; }
.mode-btn-active { @apply bg-blue-600 text-white; }

/* Innings tabs */
.innings-tab { @apply px-4 py-2 rounded-lg text-sm font-medium text-white/70 bg-white/10 hover:bg-white/20 transition-all; }
.innings-tab-active { @apply bg-blue-600 text-white; }

/* Run buttons */
.run-btn { @apply w-12 h-12 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all; }
.run-btn-four { @apply bg-green-600/30 hover:bg-green-600/50; }
.run-btn-six { @apply bg-purple-600/30 hover:bg-purple-600/50; }

/* Extra buttons */
.extra-btn { @apply px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all; }

/* Wicket buttons */
.wicket-btn { @apply px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all; }

/* Ball indicators */
.ball-indicator { @apply w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold; }
.ball-empty { @apply bg-white/10 text-white/30; }
.ball-dot { @apply bg-gray-600 text-white; }
.ball-run { @apply bg-blue-600 text-white; }
.ball-four { @apply bg-green-500 text-white; }
.ball-six { @apply bg-purple-500 text-white; }
.ball-wicket { @apply bg-red-600 text-white; }
.ball-extra { @apply bg-amber-500 text-white; }

/* Modal */
.modal-overlay { @apply fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4; }
.modal-content { @apply bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md; }

/* Fix for dropdown option visibility - browsers render options with white background */
select option {
  background-color: #1e293b;
  color: #ffffff;
}

select option:hover,
select option:focus,
select option:checked {
  background-color: #334155;
  color: #ffffff;
}
</style>
