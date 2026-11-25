"use strict";

const ExtraTables = (() => {
  const engines = {
    ur: RaceGames.ur, senet: RaceGames.senet, hounds: RaceGames.hounds, ...TrackGames, ...HandGames,
  };
  const by = id => document.getElementById(id);
  const root = by("extra-game");
  const art = by("extra-canvas");
  const canvasFrame = by("extra-board-frame");
  const handTray = by("extra-hand-tray");
  const dialog = by("extra-dialog");
  const dialogs = [dialog, by("extra-restart-dialog")];
  const controls = by("extra-actions");
  const optionsLabel = by("extra-choices-label");
  const group = by("extra-dice-options");
  let key, mode, state, filter, highlighted, timer, visible, storageReady = true;
  let boardLayout, boardMoves = [];
  const lastModeKey = id => "cat-v-canary.mode." + id;
  const stateKey = (id, kind) => "cat-v-canary.table.v1." + id + "." + kind;
  const plain = id => by(id).textContent;
  const setText = (id, value) => { if (plain(id) !== value) by(id).textContent = value; };
  const escapeText = text => String(text).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function restoreMode(id) {
    try { return localStorage.getItem(lastModeKey(id)) === "computer" ? "computer" : "local"; }
    catch { storageReady = false; return "local"; }
  }
  function restore(id, kind) {
    const fresh = engines[id].start();
    try {
      const stored = JSON.parse(localStorage.getItem(stateKey(id, kind)));
      if (stored && typeof stored.turn === "number" && typeof stored.phase === "string" &&
          Object.keys(fresh).every(k => Object.prototype.hasOwnProperty.call(stored, k)) &&
          (fresh.pieces?.every((row, i) => stored.pieces[i].length === row.length) ?? stored.sticks?.length === 2)) return stored;
    } catch { /* Old or incomplete saves can be replaced by a new match. */ }
    return fresh;
  }
  function save() {
    try {
      localStorage.setItem(lastModeKey(key), mode);
      localStorage.setItem(stateKey(key, mode), JSON.stringify(state));
    } catch { storageReady = false; }
  }
  function hasSave(id) {
    const kind = restoreMode(id);
    const data = restore(id, kind);
    const started = id === "slahal" ? data.phase !== "hide" || Boolean(data.notice) || data.sticks.some(n => n !== 5) : Boolean(data.last);
    return started && data.winner === null;
  }
  const engine = () => engines[key];
  const table = () => TableContent[key];
  const isBot = () => mode === "computer" && state.turn % 2 === 1 && state.winner === null;
  const sideName = (side, bot = false) => engine().names[side] + (bot ? " · Computer" : "");
  const countOf = (spec, row, end) => row.filter(p => (spec.board.kind === "yut" ? p.at : p) === end).length;
  const button = (label, style, onClick) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.className = style;
    b.addEventListener("click", onClick);
    return b;
  };

  function phaseCopy(choices) {
    if (state.winner !== null) return [engine().teams?.[state.winner] ?? sideName(state.winner), state.notice, true];
    const side = sideName(state.turn);
    if (isBot()) return [side, "The computer is playing."];
    if (key === "slahal") {
      return {
        hide: [side + " hides", "Keep the screen to your team. Choose the plain bone locations."],
        handoff: [side + " guesses", "Pass the screen to the guessing team. The bones are concealed."],
        guess: [side + " guesses", "Choose the hiders’ hands you think hold the plain bones."],
        reveal: ["The reveal", state.notice],
      }[state.phase];
    }
    if (state.phase === "cast") {
      const water = key === "senet" && state.pieces[state.turn].includes(27);
      return [side + " to play", water ? "Free the piece in Water before making any other move." :
        state.notice.includes("again") || state.notice.includes("another throw") ? state.notice : "Cast to begin the turn."];
    }
    if (!choices.some(a => a.type === "move")) return [side + " to play", "No legal move on this cast. Pass the turn."];
    return [side + " to play", "Choose one of the legal moves."];
  }

  function handEquipment() {
    if (key === "astragaloi") {
      handTray.replaceChildren();
      const display = document.createElement("div");
      display.className = "casting-mat";
      display.setAttribute("aria-label", "Four knucklebones");
      const faces = state.last?.faces ?? [1,3,4,6];
      faces.forEach(n => display.append(faceToken("astragaloi", n)));
      handTray.append(display);
      return;
    }
    const reveal = state.reveal;
    const list = document.createElement("div");
    list.className = "bone-pairs";
    for (const hider of [0, 1]) {
      const panel = document.createElement("section");
      panel.className = "bone-pair";
      const title = document.createElement("h3");
      title.textContent = "Hider " + (hider + 1);
      panel.append(title);
      const current = reveal?.hiders.indexOf(hider) ?? -1;
      const active = reveal ? current >= 0 : state.open.includes(hider);
      if (!active) {
        const empty = document.createElement("p");
        empty.textContent = "Pair found";
        panel.append(empty);
        list.append(panel);
        continue;
      }
      const hands = document.createElement("div");
      hands.className = "hands";
      ["Left", "Right"].forEach((label, side) => {
        const hand = document.createElement("span");
        const actual = reveal ? side === reveal.placements[current] : null;
        const bone = document.createElement("i");
        bone.className = "lahal-bone " + (actual === null ? "concealed" : actual ? "plain" : "banded");
        bone.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.textContent = label + (actual !== null ? actual ? " · plain" : " · marked" : "");
        hand.append(bone, text);
        hands.append(hand);
      });
      panel.append(hands);
      list.append(panel);
    }
    handTray.replaceChildren(list);
  }

  function faceToken(kind, value) {
    const die = document.createElement("span");
    const cls = {
      tetrahedra: "tetra", "casting sticks": "stick", "cowrie shells": "shell",
      "cube dice": "cube", "long dice": "long", "yut sticks": "yut", astragaloi: "astragal",
    };
    die.className = "cast-face " + cls[kind] + " face-" + value;
    if (kind === "cube dice") die.textContent = "⚀⚁⚂⚃⚄⚅"[value - 1];
    if (kind === "long dice") die.textContent = value;
    if (kind === "astragaloi") die.textContent = TableArt.numberRoman(value);
    if (["tetrahedra", "casting sticks", "yut sticks", "cowrie shells"].includes(kind)) {
      const label = { tetrahedra: ["plain tip","marked tip"], "casting sticks": ["unmarked side","marked side"],
        "yut sticks": ["rounded face", "flat face"], "cowrie shells": ["mouth down","mouth up"] }[kind];
      die.setAttribute("aria-label", label[value]);
    } else die.setAttribute("aria-label", "Face " + value);
    return die;
  }

  function renderCast() {
    const tray = by("extra-throw");
    tray.hidden = !state.last;
    tray.replaceChildren();
    if (!state.last) return;
    const note = document.createElement("strong");
    note.className = "throw-result";
    note.textContent = state.last.label;
    tray.append(note);
    const dice = document.createElement("span");
    dice.className = "faces";
    state.last.faces.forEach(n => dice.append(faceToken(state.last.kind, n)));
    tray.append(dice);
    tray.setAttribute("aria-label", sideName(state.last.side) + " cast " + state.last.label + ", " + state.last.kind);
  }

  function renderScores() {
    const spec = engine();
    const tally = by("extra-score");
    const colors = TableArt.counters(spec);
    tally.replaceChildren(...spec.names.map((name, i) => {
      const item = document.createElement("div");
      item.className = "tally-row";
      const dot = document.createElement("i");
      dot.className = "extra-disc paint-" + colors[i];
      dot.setAttribute("aria-hidden", "true");
      const tag = document.createElement("strong");
      tag.textContent = sideName(i, mode === "computer" && i % 2 === 1);
      const stats = document.createElement("span");
      if (key === "slahal") stats.textContent = state.sticks[i] + " tally sticks";
      else if (key === "astragaloi") stats.textContent = state.totals[i] + (state.totals[i] === 1 ? " cast" : " casts");
      else {
        const row = state.pieces[i];
        const waiting = countOf(spec, row, ["ur", "yut"].includes(key) ? -1 : 0);
        stats.textContent = countOf(spec, row, spec.finish) + " / " + row.length + " home" +
          (waiting ? " · " + waiting + " waiting" : "");
      }
      item.append(dot, tag, stats);
      if (state.turn === i && state.winner === null) item.setAttribute("aria-current", "true");
      return item;
    }));
    tally.classList.toggle("four-seats", spec.names.length === 4);
    by("extra-partners").hidden = !spec.teams;
    setText("extra-partners", spec.teams ? spec.teams.join(" against ") : "");
  }

  function drawBoard(choices) {
    const spec = engine();
    const withBoard = Boolean(spec.route);
    canvasFrame.hidden = !withBoard;
    handTray.hidden = withBoard;
    if (!withBoard) { handEquipment(); return; }
    canvasFrame.dataset.board = key;
    boardLayout = TableArt.board(art, spec, state, choices, highlighted);
    boardMoves = choices.filter(choice => boardLayout.positions.has(choice.tile));
    art.classList.toggle("has-destinations", boardMoves.length > 0);
  }

  function chooseBoardDestination(event) {
    if (!visible || !boardLayout || !boardMoves.length || isBot()) return;
    const bounds = art.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = (event.clientX - bounds.left) * boardLayout.width / bounds.width;
    const y = (event.clientY - bounds.top) * boardLayout.height / bounds.height;
    const hits = boardMoves.filter(move => {
      const point = boardLayout.positions.get(move.tile);
      return Math.hypot(x - point.x, y - point.y) <= point.size * .51;
    });
    if (hits.length === 1) perform(hits[0], false);
    if (hits.length > 1) {
      const names = new Set(hits.map(move => move.label));
      [...controls.children].find(control => names.has(control.textContent))?.focus({ preventScroll: true });
    }
  }

  function renderActions(choices, bot, focus) {
    const dieGroups = [...new Set(choices.map(a => a.group).filter(Boolean))];
    if (!dieGroups.includes(filter)) filter = dieGroups[0];
    group.hidden = dieGroups.length < 2 || bot;
    group.replaceChildren();
    if (!group.hidden) {
      dieGroups.forEach(die => {
        const control = button(die, "die-choice", () => { filter = die; render({ focus: "die" }); });
        control.setAttribute("aria-pressed", String(die === filter));
        control.setAttribute("aria-label", "Use " + die);
        group.append(control);
      });
    }
    const actions = choices.filter(a => !a.group || a.group === filter);
    optionsLabel.hidden = bot || !actions.some(a => a.type === "move");
    setText("extra-choices-label", dieGroups.length ? "Dice available · " + state.pending.join(" · ") : "Legal moves");
    controls.classList.toggle("move-actions", !optionsLabel.hidden);
    controls.replaceChildren();
    if (!bot) {
      for (const a of actions) {
        const control = button(a.label, a.type === "cast" || ["ready","continue"].includes(a.type) ?
          "button button-gold extra-primary" : "button extra-option", () => perform(a, true));
        if (a.tile !== undefined) {
          const set = tile => { highlighted = tile; drawBoard(actions); };
          control.addEventListener("pointerenter", () => set(a.tile));
          control.addEventListener("pointerleave", () => set(undefined));
          control.addEventListener("focus", () => set(a.tile));
          control.addEventListener("blur", () => set(undefined));
        }
        controls.append(control);
      }
    }
    if (focus === "die") group.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
    if (focus === "action") (controls.firstElementChild ?? by("extra-turn")).focus({ preventScroll: true });
    return actions;
  }

  function render({ focus } = {}) {
    if (!visible) return;
    const spec = engine();
    const choices = spec.options(state);
    const bot = isBot();
    const [title, instruction, win] = phaseCopy(choices);
    setText("extra-turn", win ? "Victory for " + title : title);
    setText("extra-instruction", instruction);
    // Turn state, dice results and the legal alternatives stay together on phones.
    by("extra-turn-token").className = "extra-disc paint-" + TableArt.counters(spec)[state.turn];
    setText("extra-notice", state.notice === instruction ? "" : state.notice);
    by("extra-notice").hidden = !plain("extra-notice");
    renderCast();
    const shown = renderActions(choices, bot, focus);
    drawBoard(bot ? [] : shown);
    renderScores();
    setText("extra-save-note", storageReady ? "Progress saves on this device." : "This browser cannot save progress.");
    root.querySelectorAll("[data-extra-mode]").forEach(element => {
      element.setAttribute("aria-pressed", String(element.dataset.extraMode === mode));
    });
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (!visible || !isBot() || dialogs.some(d => d.open)) return;
    timer = setTimeout(() => {
      if (!visible || !isBot()) return;
      const moves = engine().options(state);
      const a = key === "slahal" ? moves[Math.floor(Math.random() * moves.length)] :
        moves.reduce((best, next) => !best || (next.weight ?? -Infinity) > (best.weight ?? -Infinity) ? next : best, null);
      if (a) perform(a, false);
    }, key === "slahal" && state.phase === "reveal" ? 1600 : 640);
  }

  function perform(action, focus) {
    state = engine().apply(state, action);
    highlighted = undefined;
    filter = undefined;
    save();
    render({ focus: focus ? "action" : undefined });
  }

  function showGuide(full) {
    clearTimeout(timer);
    const entry = table();
    setText("extra-guide-title", full ? "Rules, history & sources" : "How to play");
    const list = values => "<ol>" + values.map(text => "<li>" + escapeText(text) + "</li>").join("") + "</ol>";
    const links = "<ul>" + entry.sources.map(([label, url]) =>
      '<li><a href="' + escapeText(url) + '" target="_blank" rel="noopener noreferrer">' + escapeText(label) + "</a></li>").join("") + "</ul>";
    by("extra-guide-body").innerHTML = "<p>" + escapeText(entry.goal) + "</p>" + (full ?
      "<h3>Rules at this table</h3>" + list(entry.rules) + "<h3>History</h3><p>" + escapeText(entry.history) + "</p><h3>Sources</h3>" + links :
      list(entry.quick));
    by("extra-full-guide").hidden = full;
    if (!dialog.open) dialog.showModal();
    else by("extra-guide-close").focus();
    dialog.scrollTop = 0;
  }

  art.addEventListener("click", chooseBoardDestination);
  by("extra-quick").addEventListener("click", () => showGuide(false));
  by("extra-rules").addEventListener("click", () => showGuide(true));
  by("extra-full-guide").addEventListener("click", () => showGuide(true));
  by("extra-restart").addEventListener("click", () => {
    clearTimeout(timer);
    by("extra-restart-dialog").showModal();
  });
  by("extra-confirm-restart").addEventListener("click", () => {
    state = engine().start();
    highlighted = undefined;
    filter = undefined;
    save();
    by("extra-restart-dialog").close();
    render({ focus: "action" });
  });
  by("extra-guide-close").addEventListener("click", () => dialog.close());
  by("extra-keep-playing").addEventListener("click", () => by("extra-restart-dialog").close());
  dialogs.forEach(d => d.addEventListener("close", schedule));
  root.querySelectorAll("[data-extra-mode]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.extraMode === mode) return;
    mode = b.dataset.extraMode;
    state = restore(key, mode);
    highlighted = undefined;
    filter = undefined;
    save();
    render();
  }));

  function open(id, focus = true) {
    if (!engines[id]) return false;
    if (!visible || id !== key) {
      clearTimeout(timer);
      key = id;
      mode = restoreMode(id);
      state = restore(id, mode);
      filter = undefined;
      highlighted = undefined;
    }
    visible = true;
    const entry = table();
    setText("extra-title", entry.title);
    setText("extra-subtitle", entry.subtitle);
    setText("extra-goal", entry.goal);
    setText("extra-local", engine().names.length === 4 ? "Local partnerships" : "Pass and play");
    setText("extra-computer", engine().names.length === 4 ? "Vs. computer team" : "Vs. computer");
    root.hidden = false;
    render();
    if (focus) by("extra-title").focus({ preventScroll: true });
    return true;
  }

  function close() {
    visible = false;
    clearTimeout(timer);
    root.hidden = true;
    for (const d of dialogs) if (d.open) d.close();
  }

  return { open, close, hasSave };
})();
