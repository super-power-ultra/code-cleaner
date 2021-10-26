const ACTIVE = 'active';

function onNavBtnClickHandler(target) {
  const $prevSelectedTab = document.querySelector(`.tab-pane.${ACTIVE}`);
  if ($prevSelectedTab.id === target) return;
  $prevSelectedTab.classList.remove(ACTIVE);
  const $selectedTab = document.querySelector(`#${target}`);
  $selectedTab.classList.add(ACTIVE);
}
