<template>
  <PlayerPerformanceSection :player-data="playerData" />
</template>

<script setup>
import PlayerPerformanceSection from '../../components/player/sections/Performance.vue';

// Define props
const props = defineProps({
  playerData: {
    type: Object,
    default: null
  }
});
</script>