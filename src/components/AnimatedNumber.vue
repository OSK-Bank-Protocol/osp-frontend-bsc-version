<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  value: { type: Number, required: true },
  decimals: { type: Number, default: 4 },
});

const displayValue = ref('');
let animationInterval = null;

const formatValue = (val) => {
  if (typeof val !== 'number' || isNaN(val)) return '0.0000';
  return val.toFixed(props.decimals);
};

const scramble = (targetValue) => {
  if (animationInterval) {
    clearInterval(animationInterval);
  }

  const duration = 800; // Total animation time in ms
  const tickRate = 50;   // How often to update the number
  let ticks = 0;
  const totalTicks = duration / tickRate;

  animationInterval = setInterval(() => {
    ticks++;
    if (ticks >= totalTicks) {
      clearInterval(animationInterval);
      animationInterval = null;
      displayValue.value = formatValue(targetValue);
    } else {
      // Generate a random number around the target for a nice "jitter" effect
      const randomFactor = 0.5 + Math.random(); // from 0.5 to 1.5
      const scrambled = targetValue * randomFactor;
      displayValue.value = formatValue(scrambled);
    }
  }, tickRate);
};

watch(() => props.value, (newValue, oldValue) => {
  // Don't animate on initial load
  if (oldValue === undefined) {
    displayValue.value = formatValue(newValue);
  } else {
    scramble(newValue);
  }
}, { immediate: true });

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval);
  }
});
</script>

<style scoped>
/* This component is designed to be styless and inherit all styles from its parent */
span {
  all: unset;
}
</style>
