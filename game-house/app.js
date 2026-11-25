"use strict";

const names = ["Cat", "Canary"];
const guides = {
  quick: {
    title: "How to play",
    html: `<ol>
      <li><strong>Place.</strong> Take turns putting one of your nine pieces on an empty point.</li>
      <li><strong>Make a mill.</strong> Put three of your pieces in a straight, connected line. Then take one opposing piece. The board marks the pieces you can take.</li>
      <li><strong>Move.</strong> Once all pieces have been placed, select one of your pieces and slide it along a line to an adjacent empty point. With exactly three left, you can jump to any empty point.</li>
      <li><strong>Win.</strong> Leave your rival with fewer than three pieces or no legal move after placement.</li>
    </ol>
    <button type="button" class="button button-outline" data-guide="rules">Full rules, history &amp; sources</button>`,
  },
  rules: {
    title: "Rules, history & sources",
    html: `<h3>The board and pieces</h3>
    <p>Use nine pieces per side and a board with three nested squares joined at the midpoints. The board has 24 playable points. Lines connect adjacent points. The app uses crimson diamonds for Cat and gold stars for Canary.</p>
    <h3>Rules at this table</h3>
    <ol>
      <li>Cat goes first. Alternate placing one piece on an empty point until both reserves are empty. A capture removes a placed piece and does not change either reserve.</li>
      <li>Three of your pieces on one marked straight line make a mill. Once you complete a mill, take one opposing piece before passing the turn. If any opposing piece is outside a mill, choose from those pieces. If all are in mills, you may take any one. A double mill still earns one capture.</li>
      <li>After placement, slide one of your pieces along a line to the next empty point. If you have exactly three pieces left, you may move one of them to any empty point. Breaking and later closing a mill earns a capture each time it closes.</li>
      <li>Once placement is complete, you lose if you have fewer than three pieces or have no legal move on your turn. Captures are counted on the scorecard.</li>
      <li>This table calls a draw on the third occurrence of the same board and side to move, or after 50 individual moves without a capture.</li>
    </ol>
    <h3>History and variants</h3>
    <p>Nine Men’s Morris, also called Merels or Mill, is well documented in medieval Europe. A game of alquerque de nueve appears in Alfonso X’s illustrated <em>Libro de los juegos</em> of 1283. Similar carved diagrams can be difficult to date or identify on their own. The flying rule and treatment of protected pieces vary across published rules and traditions. The draw limits here are digital house rules.</p>
    <h3>Sources</h3>
    <ul>
      <li><a href="https://www.britannica.com/topic/nine-mens-morris" target="_blank" rel="noopener noreferrer">Encyclopaedia Britannica · Nine Men’s Morris</a></li>
      <li><a href="https://www.mastersofgames.com/rules/morris-rules.htm" target="_blank" rel="noopener noreferrer">Masters Traditional Games · Rules of Nine Men’s Morris</a></li>
    </ul>`,
  },
};

const storageKey = "cat-v-canary.morris.v1";
const modeNames = ["local", "computer"];
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const info = $("#info-dialog");
const restart = $("#restart-dialog");
const game = $("#game");
const board = $("#board");
const moveList = $("#keyboard-moves");
let saved = readSave();
let mode = saved.mode;
let state = saved.matches[mode];
let selection = null;
let activePoint = 0;
let timer;
let storageWorks = true;

function readSave() {
  const defaults = { mode: "local", matches: { local: Morris.start(), computer: Morris.start() } };
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey));
    if (!parsed || !modeNames.includes(parsed.mode)) return defaults;
    for (const mode of modeNames) {
      const match = parsed.matches?.[mode];
      if (match?.board?.length === 24 && match.board.every(piece => [null, 0, 1].includes(piece)) &&
          match.reserve?.length === 2 && match.reserve.every(n => Number.isInteger(n) && n >= 0 && n <= 9) &&
          [0, 1].includes(match.turn) && [null, 0, 1, "draw"].includes(match.winner) &&
          typeof match.capture === "boolean" && Number.isInteger(match.quiet) &&
          match.seen && typeof match.seen === "object") {
        defaults.matches[mode] = match;
      }
    }
    defaults.mode = parsed.mode;
  } catch {
    // A fresh board is safe when saving is disabled or older data is unreadable.
  }
  return defaults;
}

function save() {
  saved.mode = mode;
  saved.matches[mode] = state;
  try {
    localStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    storageWorks = false;
  }
}

function legalPoints() {
  const legal = Morris.legal(state);
  if (state.capture) return legal.map(action => action.at);
  if (state.reserve[state.turn]) return legal.map(action => action.to);
  const sources = [...new Set(legal.map(action => action.from))];
  const destinations = legal.filter(action => action.from === selection).map(action => action.to);
  return [...sources, ...destinations];
}

function computerTurn() {
  return mode === "computer" && state.turn === 1 && state.winner === null;
}

function pointLabel(index) {
  const [x, y] = Morris.points[index];
  return String.fromCharCode(65 + x) + (y + 1);
}

function token(side) {
  const piece = document.createElement("span");
  piece.className = "token " + (side === 1 ? "canary" : "cat");
  piece.setAttribute("aria-hidden", "true");
  return piece;
}

const points = Morris.points.map(([x, y], index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "point";
  button.style.left = (7.7 + x * 84.6 / 6) + "%";
  button.style.top = (7.7 + y * 84.6 / 6) + "%";
  button.addEventListener("click", () => selectPoint(index));
  button.addEventListener("keydown", event => navigateBoard(event, index));
  board.append(button);
  return button;
});

function navigateBoard(event, index) {
  const vectors = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const vector = vectors[event.key];
  if (!vector) return;
  event.preventDefault();
  const [x, y] = Morris.points[index];
  let next = index;
  let best = Infinity;
  for (const [i, [toX, toY]] of Morris.points.entries()) {
    const forward = (toX - x) * vector[0] + (toY - y) * vector[1];
    const sideways = Math.abs((toX - x) * vector[1] + (toY - y) * vector[0]);
    if (forward <= 0) continue;
    const distance = forward + 2 * sideways;
    if (distance < best) {
      best = distance;
      next = i;
    }
  }
  points[activePoint].tabIndex = -1;
  activePoint = next;
  points[next].tabIndex = 0;
  points[next].focus();
}

function selectPoint(index) {
  if (computerTurn() || state.winner !== null) return;
  const legal = Morris.legal(state);
  const action = legal.find(move => move.at === index ||
    (move.to === index && (move.kind === "place" || move.from === selection)));
  if (action) {
    commit(action);
  } else if (legal.some(move => move.from === index)) {
    selection = selection === index ? null : index;
    render();
  } else {
    return;
  }
  points[activePoint].tabIndex = -1;
  activePoint = index;
  points[index].tabIndex = 0;
}

function commit(action) {
  const next = Morris.apply(state, action);
  if (next === state) return;
  state = next;
  selection = null;
  save();
  render();
}

function scheduleComputer() {
  clearTimeout(timer);
  if (game.hidden || info.open || restart.open || !computerTurn()) return;
  timer = setTimeout(() => {
    const action = Morris.choose(state);
    if (action) commit(action);
  }, state.capture ? 410 : 580);
}

function turnMessage() {
  if (state.winner === "draw") return ["A draw", "The table is tied. Restart to play again."];
  if (state.winner !== null) {
    const rival = 1 - state.winner;
    return [names[state.winner] + " wins!", Morris.onBoard(state.board, rival).length < 3 ?
      names[rival] + " has fewer than three pieces." : names[rival] + " has no legal move."];
  }
  const title = names[state.turn] + "’s turn";
  if (computerTurn()) return [title, state.capture ? "Canary is choosing a piece to take…" : "Canary is considering a move…"];
  if (state.capture) return [title, "A mill! Take a marked rival piece."];
  if (state.reserve[state.turn]) return [title, "Place a piece on an empty point."];
  const flying = Morris.onBoard(state.board, state.turn).length === 3;
  if (selection !== null) return [title, flying ? "Jump to any empty point." : "Move to a marked empty point."];
  return [title, flying ? "Choose a piece to jump." : "Choose a marked piece to move."];
}

function render() {
  const [title, instruction] = turnMessage();
  if ($("#turn-title").textContent !== title) $("#turn-title").textContent = title;
  if ($("#turn-instruction").textContent !== instruction) $("#turn-instruction").textContent = instruction;
  $("#turn-token").className = "token " + ((state.winner === 1 || state.winner !== 0 && state.turn === 1) ? "canary" : "cat");
  const legal = computerTurn() ? [] : legalPoints();
  if (!points.includes(document.activeElement) && !legal.includes(activePoint) && legal.length) activePoint = legal[0];

  points.forEach((button, i) => {
    const piece = state.board[i];
    const available = legal.includes(i);
    button.replaceChildren(...(piece === null ? [] : [token(piece)]));
    button.className = "point";
    button.classList.toggle("legal", available);
    button.classList.toggle("capture", available && state.capture);
    button.classList.toggle("is-selected", i === selection);
    button.setAttribute("aria-disabled", String(!available));
    const occupant = piece === null ? "empty" : names[piece];
    const hint = available ? state.capture ? ", can take" : piece === null ? ", can play here" : ", can select" : "";
    button.setAttribute("aria-label", pointLabel(i) + ", " + occupant + hint + (i === selection ? ", selected" : ""));
    button.tabIndex = i === activePoint ? 0 : -1;
  });

  $("#scores").replaceChildren(...names.map((name, side) => {
    const row = document.createElement("div");
    row.className = "score-row";
    const nameLabel = document.createElement("strong");
    nameLabel.textContent = name + (side === 1 && mode === "computer" ? " · Computer" : "");
    const tally = document.createElement("span");
    const captured = 9 - state.reserve[1 - side] - Morris.onBoard(state.board, 1 - side).length;
    tally.textContent = state.reserve[side] + " in reserve · " + captured + " captured";
    row.append(token(side), nameLabel, tally);
    return row;
  }));
  $("#save-status").textContent = storageWorks ? "Progress is saved on this device." : "Browser storage is unavailable. Progress lasts while this page stays open.";
  all("[data-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
  moveList.hidden = !legal.length;
  $("#feature-play").textContent = Object.values(saved.matches).some(match => match.reserve.some(count => count < 9) && match.winner === null) ?
    "Resume" : "Play";
  scheduleComputer();
}

function showInfo(title, html) {
  clearTimeout(timer);
  $("#info-title").textContent = title;
  $("#info-body").innerHTML = html;
  info.scrollTop = 0;
  if (!info.open) info.showModal();
  else info.querySelector(".close").focus();
}

function showMoves() {
  showInfo("Legal moves", '<p>Choose a board point by its coordinates.</p><div class="move-list"></div>');
  const list = info.querySelector(".move-list");
  for (const index of legalPoints()) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = pointLabel(index);
    button.setAttribute("aria-label", points[index].getAttribute("aria-label"));
    button.addEventListener("click", () => {
      info.close();
      selectPoint(index);
      if (selection !== null) moveList.focus();
      else points[index].focus();
    });
    list.append(button);
  }
}

let previousView = "house";
let extraRoute;

function updateCollection() {
  for (const anchor of all("[data-entry]")) {
    anchor.querySelector(".game-action").textContent = ExtraTables.hasSave(anchor.dataset.entry) ? "Resume" : "Play";
  }
}

function route() {
  const hash = location.hash;
  const id = hash === "#extra-title" ? extraRoute : hash.startsWith("#play-") ? hash.slice(6) : undefined;
  const extra = id && Object.prototype.hasOwnProperty.call(TableContent, id);
  const morris = ["#play", "#game-title"].includes(hash);
  const view = extra ? id : morris ? "morris" : "house";
  const changed = view !== previousView;
  $("#house").hidden = view !== "house";
  game.hidden = !morris;
  $(".skip").href = extra ? "#extra-title" : morris ? "#game-title" : "#main";

  if (!morris && previousView === "morris") {
    if (info.open) info.close();
    if (restart.open) restart.close();
  }
  if (extra) {
    extraRoute = id;
    ExtraTables.open(id, changed);
  } else {
    ExtraTables.close();
  }
  render();
  if (view === "house") {
    updateCollection();
    if (changed) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView();
        target.querySelector("h1, h2")?.focus({ preventScroll: true });
      } else window.scrollTo({ top: 0, behavior: "instant" });
    }
  } else if (changed) {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (morris) $("#game-title").focus({ preventScroll: true });
  }
  previousView = view;
}

document.addEventListener("click", event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.hasAttribute("data-close")) target.closest("dialog").close();
  if (target.dataset.guide) {
    const guide = guides[target.dataset.guide];
    showInfo(guide.title, guide.html);
  }
  if (target.dataset.mode && target.dataset.mode !== mode) {
    mode = target.dataset.mode;
    state = saved.matches[mode];
    selection = null;
    save();
    render();
  }
});

moveList.addEventListener("click", showMoves);
$("#restart").addEventListener("click", () => {
  clearTimeout(timer);
  restart.showModal();
});
$("#confirm-restart").addEventListener("click", () => {
  state = Morris.start();
  selection = null;
  activePoint = 0;
  save();
  render();
  restart.close();
  points[activePoint].focus({ preventScroll: true });
});
for (const dialog of [info, restart]) dialog.addEventListener("close", scheduleComputer);
window.addEventListener("hashchange", route);

GameArt.drawBoard($("#board-lines"));
save();
route();
$("#play-notice").hidden = true;
