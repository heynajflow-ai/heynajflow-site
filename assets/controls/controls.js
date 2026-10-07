(() => {
  const section = document.querySelector('#controls');
  if (!section) return;

  const find = (selector) => section.querySelector(selector);
  const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
  const panels = Array.from(section.querySelectorAll('[role="tabpanel"]'));
  function selectTab(name, moveFocus) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.tab === name;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== name; });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab, false));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex].dataset.tab, true);
    });
  });

  function syncMode(group) {
    section.querySelectorAll(`[data-option="${group}"]`).forEach((card) => {
      card.classList.toggle('is-selected', card.querySelector('input').checked);
    });
  }

  section.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => syncMode(input.closest('[data-option]').dataset.option));
  });

  function updateNotificationSummary() {
    const scope = find('#controls-notification-scope').selectedOptions[0].textContent;
    const delivery = find('#controls-notification-delivery').selectedOptions[0].textContent;
    find('#controls-notification-summary-title').textContent = `${scope} · ${delivery}`;
  }

  section.querySelectorAll('#controls-notification-scope, #controls-notification-delivery').forEach((select) => {
    select.addEventListener('change', updateNotificationSummary);
  });

  section.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.checked = input.defaultChecked;
  });
  section.querySelectorAll('select').forEach((select) => {
    select.selectedIndex = Array.from(select.options).findIndex((option) => option.defaultSelected);
    if (select.selectedIndex < 0) select.selectedIndex = 0;
  });
  syncMode('capture');
  syncMode('attention');
  updateNotificationSummary();
  selectTab('capture', false);
})();
