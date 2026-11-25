"use strict";

const HandGames = (() => {
  const { choose, cast, sum, copyMatch, takeTurn, complete, lastCast, initial } = RaceGames;

  const twoHands = [
    [0, 0, "Both left"], [1, 1, "Both right"], [0, 1, "Outside"], [1, 0, "Inside"],
  ];
  function handsFor(state) {
    if (state.open.length === 2) return twoHands.map(([a, b, name]) => [name, [a, b]]);
    return ["Left", "Right"].map((name, i) => [name, state.open.map(() => i)]);
  }
  function lahalOptions(state) {
    if (state.winner !== null) return [];
    const { phase } = state;
    if (phase === "handoff") return [choose("ready", "Ready to guess")];
    if (phase === "reveal") return [choose("continue", "Continue to the hiding team")];
    return handsFor(state).map(([label, locations]) => choose(phase, label, { locations }));
  }
  function lahalApply(current, input) {
    const state = copyMatch(current);
    if (input.type === "hide") {
      state.hidden = input.locations;
      state.reveal = null;
      state.turn = 1 - state.holder;
      state.phase = "handoff";
      state.notice = "";
    } else if (input.type === "ready") {
      state.phase = "guess";
    } else if (input.type === "continue") {
      state.phase = "hide";
      state.turn = state.holder;
      state.reveal = null;
    } else {
      const guessed = input.locations;
      const missed = state.open.filter((_, index) => guessed[index] !== state.hidden[index]);
      const transfer = Math.min(state.sticks[state.turn], missed.length);
      state.sticks[state.turn] -= transfer;
      state.sticks[state.holder] += transfer;
      state.reveal = { placements: state.hidden, hiders: state.open, guessed, matched: state.open.length - missed.length };
      state.open = missed.length ? missed : [0, 1];
      state.notice = missed.length === 0 ? "Every open pair found. The guessing team takes over hiding." :
        (transfer === 1 ? "One stick" : transfer + " sticks") + " to the hiding team." +
        (missed.length === 1 ? " Play the remaining pair." : " Both pairs stay in play.");
      if (state.sticks[state.holder] === 10) complete(state, state.holder, "The hiding team has all ten sticks.");
      if (state.winner === null) {
        if (!missed.length) state.holder = state.turn;
        state.phase = "reveal";
      }
      state.hidden = null;
    }
    return state;
  }
  const slahal = {
    start: () => ({ turn: 0, holder: 0, phase: "hide", winner: null, sticks: [5,5], open: [0,1], hidden: null, reveal: null, notice: "" }),
    options: lahalOptions, apply: lahalApply,
    board: { kind: "slahal" }, names: ["Crimson team", "Gold team"],
  };

  function classify(faces) {
    if (new Set(faces).size === 4) return "Venus";
    if (faces.every(value => value === 1)) return "Canis";
    if (new Set(faces).size === 1) return "Vulture";
    if (faces.includes(6)) return "Senio";
    return "Ordinary cast";
  }
  const astragaloi = {
    start: () => ({ ...initial([[], []]), totals: [0,0] }),
    options: state => state.winner === null ? [choose("cast", "Cast four knucklebones")] : [],
    apply(current, _a, random = Math.random) {
      const state = copyMatch(current);
      const faces = cast(4, [1, 3, 3, 3, 3, 4, 4, 4, 4, 6], random);
      const name = classify(faces);
      state.totals[state.turn]++;
      lastCast(state, "astragaloi", faces, name + " · " + sum(faces));
      return name === "Venus" ? complete(state, state.turn, "Venus! All four faces are different.") :
        takeTurn(state, name + " · The other side casts next.");
    },
    board: { kind: "astragaloi" }, names: ["Crimson", "Gold"],
  };
  return { slahal, astragaloi };
})();
