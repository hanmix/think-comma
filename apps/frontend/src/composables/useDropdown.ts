import { computed, onBeforeUnmount, ref, watch } from 'vue';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UseDropdownParams {
  options: () => DropdownOption[];
  value: () => string;
  disabled?: () => boolean;
  maxHeight?: () => number; // for direction calculation
  onSelect?: (val: string) => void;
}

export function useDropdown(params: UseDropdownParams) {
  const open = ref(false);
  const activeIndex = ref<number>(-1);
  const direction = ref<'down' | 'up'>('down');

  const triggerId = `tc-dropdown-trigger-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
  const listboxId = `tc-dropdown-list-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

  const triggerEl = ref<HTMLElement | null>(null);
  const overlayEl = ref<HTMLElement | null>(null);
  const rootEl = ref<HTMLElement | null>(null);

  const selectedOption = computed(
    () => params.options().find(o => o.value === (params.value() ?? '')) || null
  );

  function updateDirection() {
    const t = triggerEl.value;
    if (!t) return;
    const rect = t.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const mh = params.maxHeight ? params.maxHeight() : 320;
    direction.value = spaceBelow < mh && rect.top > spaceBelow ? 'up' : 'down';
  }

  function setInitialActive() {
    const idx = params.options().findIndex(o => o.value === params.value());
    activeIndex.value = idx >= 0 ? idx : 0;
  }

  function openMenu() {
    if (params.disabled && params.disabled()) return;
    if (open.value) return;
    open.value = true;
    updateDirection();
    setInitialActive();
    addGlobalListeners();
  }

  function closeMenu() {
    if (!open.value) return;
    open.value = false;
    removeGlobalListeners();
  }

  function toggle() {
    open.value ? closeMenu() : openMenu();
  }

  function setActive(idx: number) {
    const opts = params.options();
    if (idx < 0 || idx >= opts.length) return;
    if (opts[idx]?.disabled) return;
    activeIndex.value = idx;
    // scroll into view if overlay present
    const container = overlayEl.value;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`[data-index="${idx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  function moveActive(delta: number) {
    const opts = params.options();
    if (!opts.length) return;
    let idx = activeIndex.value;
    for (let i = 0; i < opts.length; i++) {
      idx = (idx + delta + opts.length) % opts.length;
      if (!opts[idx]?.disabled) break;
    }
    setActive(idx);
  }

  function selectValue(val: string) {
    params.onSelect ? params.onSelect(val) : undefined;
    closeMenu();
    requestAnimationFrame(() => triggerEl.value?.focus());
  }

  function commitActive() {
    const idx = activeIndex.value;
    const opts = params.options();
    if (idx < 0 || idx >= opts.length) return;
    const opt = opts[idx];
    if (opt.disabled) return;
    selectValue(opt.value);
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (params.disabled && params.disabled()) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open.value) openMenu();
      else moveActive(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open.value ? commitActive() : openMenu();
    } else if (e.key === 'Escape') {
      closeMenu();
    }
  }

  function onOverlayKeydown(e: KeyboardEvent) {
    if (!open.value) return;
    if (e.key === 'ArrowDown') moveActive(1);
    else if (e.key === 'ArrowUp') moveActive(-1);
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(params.options().length - 1);
    else if (e.key === 'Enter') commitActive();
    else if (e.key === 'Escape') closeMenu();
  }

  function onWindowResize() {
    if (open.value) updateDirection();
  }
  function onWindowScroll() {
    if (open.value) updateDirection();
  }
  function onDocMouseDown(e: MouseEvent) {
    const path = e.composedPath() as EventTarget[];
    if (
      !path.includes(triggerEl.value as any) &&
      !path.includes(overlayEl.value as any)
    ) {
      closeMenu();
    }
  }
  function addGlobalListeners() {
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, true);
    document.addEventListener('mousedown', onDocMouseDown, true);
  }
  function removeGlobalListeners() {
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('scroll', onWindowScroll, true);
    document.removeEventListener('mousedown', onDocMouseDown, true);
  }

  watch(open, val => {
    if (val) updateDirection();
  });

  onBeforeUnmount(() => removeGlobalListeners());

  // Headless helper props (optional)
  const getTriggerProps = () =>
    ({
      id: triggerId,
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-expanded': open.value ? 'true' : 'false',
      'aria-controls': open.value ? listboxId : undefined,
      onClick: toggle,
      onKeydown: onTriggerKeydown,
    } as const);

  const getListboxProps = () =>
    ({
      id: listboxId,
      role: 'listbox',
      'aria-labelledby': triggerId,
      onKeydown: onOverlayKeydown,
    } as const);

  const getOptionProps = (option: DropdownOption, index: number) =>
    ({
      role: 'option',
      'aria-selected': option.value === params.value() ? 'true' : 'false',
      'aria-disabled': option.disabled ? 'true' : undefined,
      'data-index': index,
      onMousemove: () => (activeIndex.value = index),
      onMousedown: (e: MouseEvent) => {
        e.preventDefault();
        if (!option.disabled) selectValue(option.value);
      },
    } as const);

  return {
    // state
    open,
    activeIndex,
    direction,
    selectedOption,
    // ids & refs
    triggerId,
    listboxId,
    triggerEl,
    overlayEl,
    rootEl,
    // actions
    openMenu,
    closeMenu,
    toggle,
    setActive,
    moveActive,
    commitActive,
    selectValue,
    // handlers
    onTriggerKeydown,
    onOverlayKeydown,
    // headless props helpers
    getTriggerProps,
    getListboxProps,
    getOptionProps,
  };
}
