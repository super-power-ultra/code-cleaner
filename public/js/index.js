const ACTIVE = 'active';

function onNavBtnClickHandler(target) {
  const $prevSelectedTab = document.querySelector(`.tab-pane.${ACTIVE}`);
  if ($prevSelectedTab.id === target) return;
  $prevSelectedTab.classList.remove(ACTIVE);
  const $selectedTab = document.querySelector(`#${target}`);
  $selectedTab.classList.add(ACTIVE);
}

window.onsubmit = async (e) => {
  e.preventDefault();
  const $form = e.target;
  const { action, method } = $form;
  const data = new URLSearchParams(new FormData($form));

  const result = await fetch(action, {
    method,
    body: data,
  }).then((res) => res.json()).catch((err) => err);

  alert(JSON.stringify(result));
};
