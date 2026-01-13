<template>
  <div class="custom-select" :class="{ open: isOpen }" v-click-outside="close">
    <div class="select-selected" @click="toggle">
      {{ selectedOptionText }}
      <span class="select-arrow"></span>
    </div>
    <transition name="select-animation">
      <div class="select-items" v-show="isOpen">
        <div
          v-for="option in options"
          :key="option.value"
          class="select-item"
          @click="selectOption(option)"
        >
          {{ option.text }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

// Simple v-click-outside directive
const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};

export default {
  name: 'CustomSelect',
  directives: {
    clickOutside,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false);

    const selectedOptionText = computed(() => {
      const selected = props.options.find(opt => opt.value === props.modelValue);
      return selected ? selected.text : 'Select an option';
    });

    const toggle = () => {
      isOpen.value = !isOpen.value;
    };

    const close = () => {
      isOpen.value = false;
    };

    const selectOption = (option) => {
      emit('update:modelValue', option.value);
      close();
    };

    return {
      isOpen,
      selectedOptionText,
      toggle,
      close,
      selectOption,
    };
  },
};
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.select-selected {
  width: 100%;
  padding: 15px 20px;
  background-color: #0c0c0e;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--white);
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* transition: border-color 0.3s ease; (Removed to prevent color change) */
}

.custom-select.open .select-selected {
  /* border-color: var(--primary); (Removed to prevent color change) */
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.select-arrow {
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 1em;
  transition: transform 0.3s ease;
}

.custom-select.open .select-arrow {
  transform: rotate(180deg);
}

.select-items {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #0c0c0e;
  border: 1px solid var(--line); /* Changed from var(--primary) to var(--line) */
  border-top: none;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 1060;
  max-height: 200px;
  overflow-y: auto;
  transform-origin: top center;
}

.select-item {
  padding: 15px 20px;
  color: var(--text-2);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.select-item:hover {
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
}

/* --- Transition Animation --- */
.select-animation-enter-active,
.select-animation-leave-active {
  transition: transform 0.2s cubic-bezier(0.5, 0, 0, 1.25), opacity 0.2s ease;
}

.select-animation-enter-from,
.select-animation-leave-to {
  transform: scaleY(0.9) translateY(-10px);
  opacity: 0;
}
</style>
