<template>
  <div :class="logoClasses" @click="handleClick">
    <span class="tc-logo__text">
      고민<span class="tc-logo__comma">{{
        variant === "emphasis" ? "," : ","
      }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import "./TcLogo.scss";

interface TcLogoProps {
  variant?: "basic" | "minimal" | "emphasis" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  clickable?: boolean;
}

const props = withDefaults(defineProps<TcLogoProps>(), {
  variant: "basic",
  size: "md",
  animated: true,
  clickable: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const logoClasses = computed(() => [
  "tc-logo",
  `tc-logo--${props.variant}`,
  `tc-logo--${props.size}`,
  {
    "tc-logo--animated": props.animated,
    "tc-logo--clickable": props.clickable,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit("click", event);
  }
};
</script>
