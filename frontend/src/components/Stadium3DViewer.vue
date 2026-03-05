<template>
  <div class="stadium-viewer" ref="containerRef">
    <!-- Ambient Particles Background -->
    <div class="particles-bg">
      <div v-for="i in 30" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- Stadium Map -->
    <div class="map-container" :class="{ 'zoomed': activeSection }">
      <!-- Glow Effect Ring -->
      <div class="stadium-glow-ring"></div>
      
      <svg viewBox="0 0 400 400" class="stadium-svg">
        <defs>
          <radialGradient id="fieldGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#86efac"/>
            <stop offset="40%" stop-color="#4ade80"/>
            <stop offset="80%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#16a34a"/>
          </radialGradient>
          
          <filter id="sectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <linearGradient id="pitchStripe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#4ade80" stop-opacity="0.3"/>
            <stop offset="50%" stop-color="#86efac" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#4ade80" stop-opacity="0.3"/>
          </linearGradient>
        </defs>
        
        <!-- Outer Stadium Ring -->
        <circle cx="200" cy="200" r="195" fill="#e2e8f0" class="stadium-outer"/>
        
        <!-- Animated Crowd Wave Effect -->
        <g class="crowd-wave" style="display: none;">
          <circle v-for="i in 3" :key="'wave-'+i" 
            cx="200" cy="200" :r="130 + i * 20" 
            fill="none" stroke="rgba(16,185,129,0.1)" 
            stroke-width="1"
            :style="{ animationDelay: `${i * 0.5}s` }"
            class="wave-ring"
          />
        </g>
        
        <!-- Sections with Enhanced Visuals -->
        <g v-for="(section, idx) in displaySections" :key="section.code">
          <!-- Section Background Glow -->
          <path 
            v-if="activeSection === section.code || hoveredSection === section.code"
            :d="getSectionPath(section, idx, 5)"
            :fill="section.color"
            opacity="0.2"
            filter="url(#sectionGlow)"
            class="section-glow-bg"
          />
          
          <!-- Main Section -->
          <path 
            :d="getSectionPath(section, idx)"
            :class="['section-arc', { 
              active: activeSection === section.code, 
              hovered: hoveredSection === section.code, 
              dimmed: activeSection && activeSection !== section.code,
              'has-seats': getSectionStats(section.code).available > 0
            }]"
            :fill="getSectionGradient(section)"
            :stroke="getSectionStroke(section)"
            stroke-width="2"
            @click="handleSectionClick(section.code)"
            @mouseenter="handleSectionHover(section.code, $event)"
            @mouseleave="hoveredSection = null"
          />
          
          <!-- Capacity Indicator Arc -->
          <path 
            :d="getCapacityArc(section, idx)"
            :stroke="section.color"
            stroke-width="3"
            fill="none"
            opacity="0.8"
            class="capacity-indicator"
            :stroke-dasharray="getCapacityDashArray(section.code)"
          />
        </g>
        
        <!-- Field with Grass Texture -->
        <circle cx="200" cy="200" r="120" fill="url(#fieldGradient)" class="cricket-field"/>
        
        <!-- Pitch Stripes -->
        <g class="pitch-stripes">
          <rect v-for="i in 8" :key="'stripe-'+i"
            :x="191" :y="162 + i * 9.5" 
            width="18" height="4.5" 
            fill="url(#pitchStripe)"
            opacity="0.4"
          />
        </g>
        
        <!-- Pitch -->
        <rect x="191" y="162" width="18" height="76" rx="2" fill="#f5e6d3" opacity="0.9"/>
        
        <!-- Boundary Lines -->
        <circle cx="200" cy="200" r="112" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" class="boundary-line"/>
        <circle cx="200" cy="200" r="55" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-dasharray="8,4" class="inner-circle"/>
        
        <!-- Stumps -->
        <g class="stumps">
          <rect x="198" y="165" width="1.5" height="8" fill="#fff" opacity="0.95"/>
          <rect x="200.5" y="165" width="1.5" height="8" fill="#fff" opacity="0.95"/>
          <rect x="203" y="165" width="1.5" height="8" fill="#fff" opacity="0.95"/>
          
          <rect x="198" y="227" width="1.5" height="8" fill="#fff" opacity="0.95"/>
          <rect x="200.5" y="227" width="1.5" height="8" fill="#fff" opacity="0.95"/>
          <rect x="203" y="227" width="1.5" height="8" fill="#fff" opacity="0.95"/>
        </g>
        
        <!-- Section Labels with Background -->
        <g v-for="(section, idx) in displaySections" :key="'l-'+section.code">
          <circle 
            :cx="getSectionLabelPos(idx).x" 
            :cy="getSectionLabelPos(idx).y - 3"
            :r="activeSection === section.code ? 16 : 14"
            :fill="activeSection === section.code ? section.color : 'rgba(15,23,42,0.8)'"
            :class="['label-bg', { active: activeSection === section.code }]"
          />
          <text 
            :x="getSectionLabelPos(idx).x" 
            :y="getSectionLabelPos(idx).y"
            :class="['section-label', { active: activeSection === section.code }]"
          >{{ section.code }}</text>
        </g>
        
        <!-- Center Icon with Animation -->
        <g v-if="!activeSection" class="center-icon">
          <circle cx="200" cy="200" r="28" fill="rgba(16,185,129,0.1)" class="pulse-ring pulse-1"/>
          <circle cx="200" cy="200" r="28" fill="rgba(16,185,129,0.1)" class="pulse-ring pulse-2"/>
          <circle cx="200" cy="200" r="28" fill="rgba(16,185,129,0.1)" class="pulse-ring pulse-3"/>
          <circle cx="200" cy="200" r="24" fill="rgba(16,185,129,0.2)"/>
          <text x="200" y="207" text-anchor="middle" fill="white" font-size="18" class="center-emoji">🏏</text>
        </g>

        <!-- Stadium Lights -->
        <g class="stadium-lights">
          <circle v-for="i in 8" :key="'light-'+i"
            :cx="200 + 185 * Math.cos((i * 45 - 90) * Math.PI / 180)"
            :cy="200 + 185 * Math.sin((i * 45 - 90) * Math.PI / 180)"
            r="4"
            fill="#fbbf24"
            class="light-bulb"
            :style="{ animationDelay: `${i * 0.2}s` }"
          />
        </g>
      </svg>
      
      <!-- Enhanced Tooltip -->
      <Transition name="tooltip-fade">
        <div v-if="hoveredSection && !activeSection" class="section-tooltip" :style="tooltipStyle">
          <div class="tooltip-header">
            <div class="tooltip-icon" :style="{ background: getHoveredSectionData?.color }">
              {{ section.code }}
            </div>
            <div class="tooltip-content">
              <div class="tooltip-name">{{ getHoveredSectionData?.name }}</div>
              <div class="tooltip-info">
                <span class="info-item">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                  </svg>
                  {{ getSectionStats(hoveredSection).available }} available
                </span>
                <span class="info-item price">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                  From ₹{{ getSectionStats(hoveredSection).minPrice }}
                </span>
              </div>
            </div>
          </div>
          <div class="tooltip-action">Click to select seats →</div>
        </div>
      </Transition>
    </div>
    
    <!-- Enhanced Section Pills with Stats -->
    <div class="section-pills-container">
      <div class="pills-header">
        <span class="pills-title">Stadium Sections</span>
        <span class="pills-subtitle">{{ displaySections.length }} sections • {{ totalAvailableSeats }} seats available</span>
      </div>
      <div class="section-pills">
        <button v-for="section in displaySections" :key="section.code"
          :class="['pill', { 
            active: activeSection === section.code,
            'low-availability': getSectionStats(section.code).available < 50,
            'sold-out': getSectionStats(section.code).available === 0
          }]"
          @click="handleSectionClick(section.code)"
          :disabled="getSectionStats(section.code).available === 0"
        >
          <span class="pill-indicator">
            <span class="pill-dot" :style="{ background: section.color }"></span>
            <span class="pill-pulse" :style="{ background: section.color }"></span>
          </span>
          <span class="pill-info">
            <span class="pill-code">{{ section.code }}</span>
            <span class="pill-name">{{ section.name }}</span>
          </span>
          <span class="pill-stats">
            <span class="pill-count">{{ getSectionStats(section.code).available }}</span>
            <span class="pill-price">₹{{ getSectionStats(section.code).minPrice }}</span>
          </span>
          <span v-if="getSectionStats(section.code).available === 0" class="sold-out-badge">SOLD OUT</span>
          <span v-else-if="getSectionStats(section.code).available < 50" class="limited-badge">LIMITED</span>
        </button>
      </div>
    </div>
    
    <!-- Seat Selector Panel -->
    <Transition name="slide-up">
      <div v-if="activeSection" class="seat-panel">
        <!-- Header -->
        <div class="panel-header">
          <button @click="activeSection = null" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="header-info">
            <span class="section-name">{{ getActiveSection?.name }}</span>
            <span class="section-meta">₹{{ getSectionStats(activeSection).minPrice }}/seat • {{ getSectionStats(activeSection).available }} left</span>
          </div>
        </div>
        
        <!-- Row Selector -->
        <div class="row-selector">
          <span class="row-label">Row</span>
          <div class="row-btns">
            <button v-for="row in sectionRows" :key="row"
              :class="['row-btn', { active: activeRow === row }]"
              @click="activeRow = row"
            >{{ row }}</button>
          </div>
        </div>
        
        <!-- Seats Grid - Cinema Style -->
        <div class="seats-container">
          <!-- Row Label -->
          <div class="row-info-bar">
            <div class="row-badge">
              <span class="row-icon">🪑</span>
              <span class="row-text">Row {{ activeRow }}</span>
            </div>
            <div class="row-stats">
              <span class="stat-item">
                <span class="stat-dot available"></span>
                {{ rowSeats.filter(s => s.status === 'available').length }} Available
              </span>
              <span class="stat-item">
                <span class="stat-dot selected"></span>
                {{ rowSeats.filter(s => selectedSeats.includes(s.seatId)).length }} Selected
              </span>
            </div>
          </div>

          <!-- Seats Grid with Aisle Gaps -->
          <div class="seats-grid-wrapper">
            <!-- Left Aisle Marker -->
            <div class="aisle-marker left">
              <div class="aisle-line"></div>
              <span class="aisle-label">AISLE</span>
            </div>

            <!-- Seats Grid -->
            <div class="seats-grid">
              <div v-for="(seat, index) in rowSeats" :key="seat.seatId" class="seat-wrapper">
                <!-- Add aisle gap after every 5 seats -->
                <div v-if="index > 0 && index % 5 === 0" class="aisle-gap">
                  <div class="aisle-divider"></div>
                </div>
                
                <button
                  :class="['seat-btn', seat.status, { 
                    selected: selectedSeats.includes(seat.seatId),
                    'best-value': isBestValue(seat),
                    'aisle-seat': isAisleSeat(index)
                  }]"
                  :disabled="seat.status !== 'available' && !selectedSeats.includes(seat.seatId)"
                  @click="handleSeatClick($event, seat)"
                  @mouseenter="hoveredSeat = seat"
                  @mouseleave="hoveredSeat = null"
                  :title="`Seat ${seat.seatNumber} - ₹${seat.price}`"
                >
                  <!-- Seat Icon/Visual -->
                  <div class="seat-visual">
                    <div class="seat-back"></div>
                    <div class="seat-cushion"></div>
                    <div class="seat-armrests">
                      <div class="armrest left"></div>
                      <div class="armrest right"></div>
                    </div>
                  </div>
                  
                  <!-- Seat Number -->
                  <span class="seat-number">{{ seat.seatNumber }}</span>
                  
                  <!-- Status Icons -->
                  <span v-if="seat.status === 'booked'" class="seat-icon">🔒</span>
                  <span v-if="seat.status === 'locked'" class="seat-icon">⛔</span>
                  <span v-if="seat.status === 'pending'" class="seat-icon">⏳</span>
                  <span v-if="selectedSeats.includes(seat.seatId)" class="seat-icon check">✓</span>
                  
                  <!-- Best Value Badge -->
                  <span v-if="isBestValue(seat) && seat.status === 'available'" class="value-badge">💎</span>
                  
                  <!-- Price Tag (on hover) -->
                  <span class="price-tag">₹{{ seat.price }}</span>
                  
                  <!-- Ripple Effect (disabled for performance) -->
                  <span class="ripple-container" style="display: none;"></span>
                </button>
              </div>
            </div>

            <!-- Right Aisle Marker -->
            <div class="aisle-marker right">
              <div class="aisle-line"></div>
              <span class="aisle-label">AISLE</span>
            </div>
          </div>

          <!-- Hover Tooltip -->
          <Transition name="fade">
            <div v-if="hoveredSeat && hoveredSeat.status === 'available'" class="seat-tooltip-floating">
              <div class="tooltip-header">
                <span class="tooltip-seat">Seat {{ hoveredSeat.seatNumber }}</span>
                <span class="tooltip-price">₹{{ hoveredSeat.price }}</span>
              </div>
              <div class="tooltip-details">
                <span class="detail-item">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ getSeatViewQuality(hoveredSeat) }}
                </span>
                <span class="detail-item">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Row {{ activeRow }}
                </span>
              </div>
              <div class="tooltip-action">Click to select</div>
            </div>
          </Transition>
        </div>
        
        <!-- Pitch Direction Indicator -->
        <div class="pitch-indicator">
          <div class="pitch-arrow">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          <span class="pitch-label">PITCH VIEW</span>
          <div class="pitch-distance">{{ Math.round(activeRow * 3) }}m from boundary</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getStadiumModel, parseSeatId } from '../utils/stadiumModels.js';

const props = defineProps({
  modelCode: { type: String, default: 'small' },
  seats: { type: Array, default: () => [] },
  selectedSeats: { type: Array, default: () => [] },
  interactive: { type: Boolean, default: true }
});

const emit = defineEmits(['seat-click', 'seat-hover']);

const containerRef = ref(null);
const activeSection = ref(null);
const activeRow = ref(1);
const hoveredSection = ref(null);
const hoveredSeat = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const stadiumModel = computed(() => getStadiumModel(props.modelCode));
const displaySections = computed(() => stadiumModel.value?.sections || []);

const totalAvailableSeats = computed(() => {
  return props.seats.filter(s => s.status === 'available').length;
});

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`
}));

const getActiveSection = computed(() => displaySections.value.find(s => s.code === activeSection.value));
const getHoveredSectionData = computed(() => displaySections.value.find(s => s.code === hoveredSection.value));

const sectionSeats = computed(() => {
  if (!activeSection.value) return [];
  return props.seats.filter(s => parseSeatId(s.seatId)?.sectionCode === activeSection.value);
});

const sectionRows = computed(() => {
  const rows = new Set(sectionSeats.value.map(s => parseSeatId(s.seatId)?.row).filter(Boolean));
  return [...rows].sort((a, b) => a - b);
});

const rowSeats = computed(() => {
  return sectionSeats.value
    .filter(s => parseSeatId(s.seatId)?.row === activeRow.value)
    .sort((a, b) => parseSeatId(a.seatId).seatNumber - parseSeatId(b.seatId).seatNumber);
});

// Particle animation helper
function getParticleStyle(index) {
  const size = Math.random() * 3 + 1;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  const x = Math.random() * 100;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  };
}

function getSectionStats(code) {
  const seats = props.seats.filter(s => parseSeatId(s.seatId)?.sectionCode === code);
  const available = seats.filter(s => s.status === 'available').length;
  const prices = seats.map(s => s.price).filter(Boolean);
  return { total: seats.length, available, minPrice: Math.min(...prices, 0) };
}

function getSectionPath(section, idx, expand = 0) {
  const total = displaySections.value.length;
  const gap = 3;
  const angleStep = 360 / total;
  const start = idx * angleStep - 90 + gap / 2;
  const end = start + angleStep - gap;
  const iR = 125 + expand, oR = 185 + expand, cx = 200, cy = 200;
  const rad = d => d * Math.PI / 180;
  return `M ${cx + iR * Math.cos(rad(start))} ${cy + iR * Math.sin(rad(start))} 
          L ${cx + oR * Math.cos(rad(start))} ${cy + oR * Math.sin(rad(start))} 
          A ${oR} ${oR} 0 0 1 ${cx + oR * Math.cos(rad(end))} ${cy + oR * Math.sin(rad(end))} 
          L ${cx + iR * Math.cos(rad(end))} ${cy + iR * Math.sin(rad(end))} 
          A ${iR} ${iR} 0 0 0 ${cx + iR * Math.cos(rad(start))} ${cy + iR * Math.sin(rad(start))} Z`;
}

function getCapacityArc(section, idx) {
  const total = displaySections.value.length;
  const gap = 3;
  const angleStep = 360 / total;
  const start = idx * angleStep - 90 + gap / 2;
  const end = start + angleStep - gap;
  const r = 190, cx = 200, cy = 200;
  const rad = d => d * Math.PI / 180;
  const largeArc = (end - start) > 180 ? 1 : 0;
  return `M ${cx + r * Math.cos(rad(start))} ${cy + r * Math.sin(rad(start))} 
          A ${r} ${r} 0 ${largeArc} 1 ${cx + r * Math.cos(rad(end))} ${cy + r * Math.sin(rad(end))}`;
}

function getCapacityDashArray(code) {
  const stats = getSectionStats(code);
  if (stats.total === 0) return '0 1000';
  const percentage = stats.available / stats.total;
  const circumference = 2 * Math.PI * 190 / displaySections.value.length;
  const filled = circumference * percentage;
  return `${filled} ${circumference - filled}`;
}

function getSectionLabelPos(idx) {
  const total = displaySections.value.length;
  const angle = idx * (360 / total) + (180 / total) - 90;
  const r = 155;
  const rad = d => d * Math.PI / 180;
  return { x: 200 + r * Math.cos(rad(angle)), y: 200 + r * Math.sin(rad(angle)) + 4 };
}

function getSectionGradient(section) {
  if (activeSection.value === section.code) return section.color;
  if (hoveredSection.value === section.code) return section.color + 'dd';
  return section.color + '44';
}

function getSectionStroke(section) {
  if (activeSection.value === section.code) return section.color;
  if (hoveredSection.value === section.code) return section.color + 'aa';
  return 'rgba(255,255,255,0.1)';
}

function handleSectionClick(code) {
  if (activeSection.value === code) {
    activeSection.value = null;
  } else {
    activeSection.value = code;
    activeRow.value = sectionRows.value[0] || 1;
  }
}

function handleSectionHover(code, event) {
  hoveredSection.value = code;
  const rect = containerRef.value?.getBoundingClientRect();
  if (rect) {
    tooltipPosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 20
    };
  }
}

function handleSeatClick(event, seat) {
  if (!props.interactive) return;
  
  // Removed ripple effect for performance
  emit('seat-click', seat);
}

// Helper functions for seat display
function isBestValue(seat) {
  if (seat.status !== 'available') return false;
  const avgPrice = rowSeats.value.reduce((sum, s) => sum + s.price, 0) / rowSeats.value.length;
  return seat.price <= avgPrice * 0.9; // 10% below average
}

function isAisleSeat(index) {
  return index % 5 === 0 || (index + 1) % 5 === 0;
}

function getSeatViewQuality(seat) {
  const row = parseSeatId(seat.seatId)?.row || 1;
  if (row <= 5) return 'Excellent View';
  if (row <= 10) return 'Great View';
  if (row <= 15) return 'Good View';
  return 'Standard View';
}

watch(activeSection, () => {
  if (sectionRows.value.length) activeRow.value = sectionRows.value[0];
});
</script>

<style scoped>
/* Main Container */
.stadium-viewer { 
  width: 100%; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  position: relative;
  background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%);
  overflow: hidden;
}

/* Particles Background */
.particles-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  display: none;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(16,185,129,0.6), transparent);
  border-radius: 50%;
  animation: none;
}

/* Map Container */
.map-container {
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: 0.5rem; 
  position: relative;
  transition: none;
  z-index: 1;
}

.map-container.zoomed { 
  filter: blur(4px); 
  opacity: 0.2; 
  pointer-events: none;
  transform: scale(0.95);
}

/* Stadium Glow Ring */
.stadium-glow-ring {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%);
  animation: none;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.5;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* SVG Stadium */
.stadium-svg { 
  width: 100%; 
  height: 100%; 
  max-width: 400px; 
  max-height: 400px;
  filter: none;
  transition: none;
}

.stadium-outer {
  filter: none;
}

/* Crowd Wave Animation */
.wave-ring {
  animation: none;
}

@keyframes waveExpand {
  0% {
    r: 130;
    opacity: 0.3;
  }
  100% {
    r: 190;
    opacity: 0;
  }
}

/* Section Arcs */
.section-arc {
  cursor: pointer;
  transition: none;
  transform-origin: center;
  filter: none;
}

.section-arc:hover, 
.section-arc.hovered { 
  transform: scale(1.02);
  filter: none;
}

.section-arc.active { 
  transform: scale(1.03);
  filter: none;
  animation: none;
}

@keyframes sectionPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.section-arc.dimmed { 
  opacity: 0.15;
  filter: grayscale(0.8);
}

.section-arc.has-seats:hover {
  cursor: pointer;
}

.section-glow-bg {
  animation: none;
}

@keyframes glowExpand {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 0.2;
    transform: scale(1);
  }
}

/* Capacity Indicator */
.capacity-indicator {
  stroke-linecap: round;
  transition: none;
  filter: none;
}

/* Cricket Field */
.cricket-field {
  filter: none;
}

.pitch-stripes {
  animation: none;
}

@keyframes grassSway {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.6; }
}

/* Boundary Lines */
.boundary-line { 
  stroke-dasharray: 8,4; 
  animation: none;
}

.inner-circle {
  animation: none;
}

/* Stumps */
.stumps rect {
  filter: none;
}

/* Section Labels */
.label-bg {
  transition: none;
  filter: none;
}

.label-bg.active {
  animation: none;
}

.section-label { 
  fill: rgba(255,255,255,0.9); 
  font-size: 11px; 
  font-weight: 800; 
  text-anchor: middle; 
  pointer-events: none;
  transition: none;
  text-shadow: none;
}

.section-label.active { 
  fill: white; 
  font-size: 13px;
  filter: none;
}

/* Center Icon */
.pulse-ring { 
  animation: none;
  opacity: 0.2;
}

.center-emoji {
  animation: none;
  filter: none;
}

/* Stadium Lights */
.light-bulb {
  animation: none;
  filter: none;
  opacity: 0.8;
}

/* Enhanced Tooltip */
.section-tooltip {
  position: absolute; 
  transform: translate(-50%, -100%);
  background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: 12px;
  padding: 0;
  pointer-events: none; 
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.1);
  min-width: 280px;
  overflow: hidden;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1));
}

.tooltip-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.tooltip-content {
  flex: 1;
}

.tooltip-name { 
  color: white; 
  font-weight: 700; 
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.tooltip-info { 
  display: flex; 
  gap: 1rem; 
  font-size: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #94a3b8;
}

.info-item.price {
  color: #10b981;
  font-weight: 600;
}

.info-item .icon {
  width: 14px;
  height: 14px;
}

.tooltip-action {
  padding: 0.5rem 1rem;
  background: rgba(16,185,129,0.1);
  border-top: 1px solid rgba(16,185,129,0.2);
  text-align: center;
  color: #10b981;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -90%) scale(0.95);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -110%) scale(0.95);
}

/* Section Pills Container */
.section-pills-container {
  padding: 0.35rem;
  background: linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.8));
  border-top: 1px solid rgba(51,65,85,0.3);
  backdrop-filter: blur(12px);
  z-index: 2;
}

.pills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  padding: 0 0.1rem;
}

.pills-title {
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pills-subtitle {
  color: #64748b;
  font-size: 0.6rem;
}

/* Pills */
.section-pills { 
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.3rem;
}

.pill {
  display: flex; 
  align-items: center; 
  gap: 0.3rem;
  padding: 0.3rem 0.5rem; 
  background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8));
  border: 1px solid rgba(51,65,85,0.5); 
  border-radius: 6px;
  color: #94a3b8; 
  font-size: 0.65rem; 
  cursor: pointer; 
  transition: transform 0.15s ease, border-color 0.15s ease;
  position: relative;
  overflow: hidden;
  will-change: transform;
}

.pill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.05));
  opacity: 0;
  transition: none;
  display: none;
}

.pill:hover::before {
  opacity: 0;
}

.pill:hover { 
  color: white; 
  transform: translateY(-1px);
  border-color: rgba(16,185,129,0.5);
}

.pill.active { 
  background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.25));
  border-color: rgba(16,185,129,0.6); 
  color: #10b981;
  transform: translateY(-1px);
}

.pill.low-availability {
  border-color: rgba(251,191,36,0.5);
}

.pill.sold-out {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(30,41,59,0.5), rgba(15,23,42,0.5));
}

.pill.sold-out:hover {
  transform: none;
  box-shadow: none;
}

.pill-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-dot { 
  width: 6px; 
  height: 6px; 
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
  z-index: 1;
}

.pill-pulse {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: none;
  opacity: 0;
}

@keyframes pillPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.pill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.pill-code {
  font-weight: 700;
  font-size: 0.7rem;
}

.pill-name {
  font-size: 0.6rem;
  opacity: 0.7;
}

.pill-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.05rem;
}

.pill-count { 
  padding: 0.1rem 0.35rem; 
  background: rgba(16,185,129,0.15); 
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: 4px; 
  font-size: 0.65rem;
  font-weight: 700;
  color: #10b981;
}

.pill-price {
  font-size: 0.6rem;
  color: #64748b;
  font-weight: 600;
}

.sold-out-badge,
.limited-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.sold-out-badge {
  background: rgba(239,68,68,0.2);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.3);
}

.limited-badge {
  background: rgba(251,191,36,0.2);
  color: #fbbf24;
  border: 1px solid rgba(251,191,36,0.3);
  animation: none;
}

/* Seat Panel */
.seat-panel {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(15,23,42,0.98), rgba(15,23,42,0.95));
  border-top: 1px solid rgba(51,65,85,0.4);
  padding: 0.3rem 0.5rem; max-height: 40vh; overflow-y: auto;
  backdrop-filter: blur(12px); z-index: 20;
}

.panel-header { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.3rem; }
.back-btn {
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  background: rgba(51,65,85,0.5); border: none; border-radius: 0.25rem;
  color: #94a3b8; cursor: pointer;
}
.back-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.back-btn svg { width: 10px; height: 10px; }
.header-info { flex: 1; }
.section-name { color: white; font-size: 0.7rem; font-weight: 600; display: block; }
.section-meta { color: #10b981; font-size: 0.6rem; }

/* Row Selector */
.row-selector { display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.3rem; }
.row-label { color: #64748b; font-size: 0.5rem; text-transform: uppercase; font-weight: 500; }
.row-btns { display: flex; gap: 0.1rem; overflow-x: auto; scrollbar-width: none; }
.row-btns::-webkit-scrollbar { display: none; }
.row-btn {
  min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid #334155; border-radius: 0.2rem;
  color: #64748b; font-size: 0.55rem; cursor: pointer; transition: all 0.2s;
}
.row-btn:hover { border-color: #64748b; color: #94a3b8; }
.row-btn.active { background: #10b981; border-color: #10b981; color: white; }

/* Seats Container */
.seats-container { padding: 0.2rem 0; }

/* Row Info Bar */
.row-info-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.3rem 0.5rem; margin-bottom: 0.4rem;
  background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1));
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 0.3rem;
}

.row-badge {
  display: flex; align-items: center; gap: 0.25rem;
  font-weight: 600; color: white; font-size: 0.7rem;
}

.row-icon { font-size: 0.8rem; }

.row-stats {
  display: flex; gap: 0.5rem; font-size: 0.6rem;
}

.stat-item {
  display: flex; align-items: center; gap: 0.2rem;
  color: #94a3b8;
}

.stat-dot {
  width: 5px; height: 5px; border-radius: 50%;
  display: inline-block;
}
.stat-dot.available { background: #22c55e; box-shadow: 0 0 5px rgba(34,197,94,0.5); }
.stat-dot.selected { background: #3b82f6; box-shadow: 0 0 5px rgba(59,130,246,0.5); }

/* Seats Grid Wrapper with Aisles */
.seats-grid-wrapper {
  display: flex; align-items: center; gap: 0.2rem;
  padding: 0 0.2rem;
}

.aisle-marker {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.15rem; opacity: 0.4;
}

.aisle-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, transparent, #64748b, transparent);
}

.aisle-label {
  writing-mode: vertical-rl;
  font-size: 0.45rem; color: #64748b;
  letter-spacing: 0.1em; font-weight: 600;
}

/* Seats Grid */
.seats-grid {
  display: flex; flex-wrap: wrap; gap: 0.25rem;
  justify-content: center; flex: 1;
}

.seat-wrapper {
  display: flex; align-items: center;
}

.aisle-gap {
  width: 12px; display: flex; align-items: center; justify-content: center;
}

.aisle-divider {
  width: 1px; height: 30px;
  background: linear-gradient(to bottom, transparent, rgba(100,116,139,0.3), transparent);
}

/* Seat Button - Cinema Style */
.seat-btn {
  position: relative;
  width: 28px; height: 32px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  border: none; border-radius: 4px 4px 2px 2px;
  cursor: pointer;
  transition: transform 0.15s ease;
  overflow: visible;
  background: transparent;
  will-change: transform;
}

/* Seat Visual - 3D Chair */
.seat-visual {
  position: relative;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center;
  transition: none;
}

.seat-back {
  width: 22px; height: 14px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 3px 3px 1px 1px;
  box-shadow: 
    inset 0 1px 3px rgba(255,255,255,0.2),
    0 2px 5px rgba(0,0,0,0.2);
  position: relative;
  z-index: 2;
}

.seat-cushion {
  width: 24px; height: 12px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 2px;
  margin-top: -1px;
  box-shadow: 
    inset 0 -1px 3px rgba(0,0,0,0.2),
    0 4px 8px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
}

.seat-armrests {
  position: absolute;
  width: 100%; height: 100%;
  top: 0; left: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  z-index: 0;
}

.armrest {
  width: 2px; height: 16px;
  background: linear-gradient(135deg, #1a9447, #15803d);
  border-radius: 1px;
  margin-top: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Seat Number */
.seat-number {
  position: absolute;
  bottom: -14px;
  font-size: 0.55rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(15,23,42,0.8);
  padding: 1px 4px;
  border-radius: 2px;
  z-index: 10;
  transition: all 0.2s;
}

/* Seat States */
.seat-btn.available:hover {
  transform: translateY(-3px) scale(1.05);
}

.seat-btn.available:hover .seat-visual {
  filter: brightness(1.1);
}

.seat-btn.available:hover .seat-number {
  color: white;
  background: rgba(16,185,129,0.9);
}

.seat-btn.selected .seat-back,
.seat-btn.selected .seat-cushion {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.seat-btn.selected .armrest {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.seat-btn.selected {
  transform: translateY(-2px) scale(1.08);
  animation: none;
}

.seat-btn.selected .seat-number {
  color: white;
  background: rgba(59,130,246,0.9);
}

.seat-btn.booked .seat-back,
.seat-btn.booked .seat-cushion {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.seat-btn.booked .armrest {
  background: linear-gradient(135deg, #4b5563, #374151);
}

.seat-btn.booked,
.seat-btn.locked {
  cursor: not-allowed;
  opacity: 0.5;
}

.seat-btn.pending .seat-back,
.seat-btn.pending .seat-cushion {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.seat-btn.pending .armrest {
  background: linear-gradient(135deg, #d97706, #b45309);
}

/* Best Value Badge */
.value-badge {
  position: absolute;
  top: -8px; right: -8px;
  font-size: 1rem;
  z-index: 15;
  animation: none;
  filter: none;
}

/* Seat Icon */
.seat-icon {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  z-index: 10;
  filter: none;
}

.seat-icon.check {
  color: white;
  font-weight: bold;
  animation: none;
}

/* Price Tag */
.price-tag {
  position: absolute;
  top: -24px;
  background: linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95));
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  z-index: 20;
}

.seat-btn:hover .price-tag {
  opacity: 1;
  transform: translateY(0);
}

/* Aisle Seat Indicator */
.seat-btn.aisle-seat::before {
  content: '';
  position: absolute;
  bottom: -4px;
  width: 20px; height: 2px;
  background: rgba(100,116,139,0.4);
  border-radius: 1px;
}

/* Floating Tooltip */
.seat-tooltip-floating {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  z-index: 100;
  min-width: 240px;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(100,116,139,0.2);
}

.tooltip-seat {
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
}

.tooltip-price {
  font-weight: 700;
  color: #10b981;
  font-size: 1rem;
}

.tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.75rem;
}

.detail-item .icon {
  width: 14px;
  height: 14px;
  color: #64748b;
}

.tooltip-action {
  text-align: center;
  color: #10b981;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(100,116,139,0.2);
}

/* Pitch Indicator */
.pitch-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px dashed rgba(100,116,139,0.3);
}

.pitch-arrow {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  animation: bounce 2s ease-in-out infinite;
}

.pitch-arrow svg {
  width: 20px;
  height: 20px;
  color: #10b981;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.pitch-label {
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pitch-distance {
  color: #64748b;
  font-size: 0.65rem;
  margin-top: 0.25rem;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Ripple Effect */
.ripple-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 5;
  display: none;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: none;
}

/* Animations */
.slide-up-enter-active { animation: slideUp 0.2s ease; }
.slide-up-leave-active { animation: slideUp 0.15s ease reverse; }
@keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
</style>
