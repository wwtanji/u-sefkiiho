const ART_SELECTOR = '.cone';
const SCOOP_SELECTOR = '.scoop';
const SHUFFLE_SELECTOR = '[data-shuffle]';
const VARIABLE_PREFIX = '--scoop-';
const WOBBLE_CLASS = 'is-wobbling';
const WOBBLE_MS = 500;
const PALETTE = ['#f58ba8', '#8fd8bb', '#fff0c2', '#8a5a3b', '#f7a65a', '#8c9be0', '#b5d77a'];

const art = document.querySelector(ART_SELECTOR);
const scoops = [...document.querySelectorAll(SCOOP_SELECTOR)];
const shuffleButton = document.querySelector(SHUFFLE_SELECTOR);
const paletteIndexes = [0, 1, 2];

function paint(position) {
  art.style.setProperty(VARIABLE_PREFIX + (position + 1), PALETTE[paletteIndexes[position]]);
}

function wobble(scoop) {
  scoop.classList.remove(WOBBLE_CLASS);
  scoop.getBoundingClientRect();
  scoop.classList.add(WOBBLE_CLASS);
  setTimeout(() => scoop.classList.remove(WOBBLE_CLASS), WOBBLE_MS);
}

function advance(position) {
  paletteIndexes[position] = (paletteIndexes[position] + 1) % PALETTE.length;
  paint(position);
  wobble(scoops[position]);
}

scoops.forEach((scoop, position) => {
  scoop.addEventListener('click', () => advance(position));
  scoop.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advance(position);
    }
  });
});

shuffleButton.addEventListener('click', () => {
  scoops.forEach((scoop, position) => {
    paletteIndexes[position] = Math.floor(Math.random() * PALETTE.length);
    paint(position);
    wobble(scoop);
  });
});
