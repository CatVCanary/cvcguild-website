"use strict";

const RaceGames = (() => {
  const series = (length, make) => Array.from({ length }, (_, index) => make(index));
  const cast = (count, sides, random) => series(count, () => sides[Math.floor(random() * sides.length)]);
  const sum = values => values.reduce((total, value) => total + value, 0);
  const choose = (type, label, details = {}) => ({ type, label, ...details });
  const action = (label, ids, from, to, tile, details = {}) => choose("move", label,
    { ids, from, to, tile, weight: to, ...details });
  const cells = (width, height, corners) => ({ width, height, cells: corners });
  // Match state contains the same JSON-compatible values used in local saves.
  const copyMatch = typeof structuredClone === "function" ? structuredClone : match => JSON.parse(JSON.stringify(match));
  const takeTurn = (state, notice, { extra = false, seats = state.pieces.length, finished } = {}) => {
    state.phase = "cast";
    state.pending = [];
    state.notice = notice;
    if (!extra) {
      do state.turn = (state.turn + 1) % seats;
      while (finished?.(state.turn));
    }
    return state;
  };
  const complete = (state, side, notice) => Object.assign(state, { winner: side, phase: "over", pending: [], notice });
  const whole = (state, finish) => state.pieces[state.turn].every(position => position === finish);
  const waiting = (count, start) => series(2, () => Array(count).fill(start));
  const initial = pieces => ({ pieces, turn: 0, phase: "cast", pending: [], last: null, notice: "", winner: null });
  const lastCast = (s, kind, faces, label) => Object.assign(s, { last: { kind, faces, label, side: s.turn }, notice: "" });
  const pass = () => choose("pass", "Pass turn");
  const castAction = label => choose("cast", label);
  const one = (pieces, predicate) => {
    const results = [];
    for (const [index, position] of pieces.entries()) {
      if (position === -1 && pieces.indexOf(-1) !== index) continue;
      const option = predicate(position, index);
      if (option) results.push(option);
    }
    return results;
  };
  const supports = (state, side, position) => state.pieces[side].includes(position - 1) || state.pieces[side].includes(position + 1);

  function standard({ start, setup, label, roll, moves, play, passTurn, describe }) {
    function options(state) {
      if (state.winner !== null) return [];
      if (state.phase === "cast") return [...(setup?.(state) ?? []), castAction(label)];
      return moves(state);
    }
    function apply(current, input, random = Math.random) {
      const state = copyMatch(current);
      if (input.type === "cast") {
        const [kind, faces, amount, title] = roll(random, state);
        lastCast(state, kind, faces, title ?? "Cast " + amount);
        state.phase = "move";
        state.pending = [amount];
        if (!moves(state).some(option => option.type === "move")) state.notice = "No legal move on this throw.";
        return state;
      }
      if (input.type === "pass") return passTurn?.(state) ?? takeTurn(state, state.notice || "The turn passes.");
      return play(state, input);
    }
    return { start, options, apply, describe };
  }

  const urRoute = side => [
    ...[3, 2, 1, 0].map(x => [x, side * 2]),
    ...series(8, x => [x, 1]),
    [7, side * 2], [6, side * 2],
  ].map(([x, y]) => x + y * 8);
  const urTracks = [urRoute(0), urRoute(1)];
  const rosettes = [3, 7, 13];
  const ur = {
    ...standard({
      start: () => initial(waiting(7, -1)),
      label: "Throw four tetrahedra",
      roll: random => {
        const faces = cast(4, [0, 1], random);
        return ["tetrahedra", faces, sum(faces)];
      },
      moves(state) {
        const n = state.pending[0], side = state.turn, rival = 1 - side;
        const own = state.pieces[side], enemy = state.pieces[rival];
        const moves = n === 0 ? [] : one(own, (from, i) => {
          const to = from + n;
          if (from === 14 || to > 14 || (to < 14 && own.includes(to))) return;
          const tile = urTracks[side][to];
          const caught = to >= 4 && to <= 11 ? enemy.indexOf(to) : -1;
          if (caught >= 0 && to === 7) return;
          const label = to === 14 ? "Bear off from " + (from + 1) :
            (from === -1 ? "Enter" : "Space " + (from + 1)) + " → " + (to + 1);
          return action(label, [i], from, to, tile, { caught, extra: rosettes.includes(to), weight: to + (caught >= 0 ? 11 : 0) + (rosettes.includes(to) ? 8 : 0) });
        });
        return moves.length ? moves : [pass()];
      },
      play(state, move) {
        const side = state.turn;
        state.pieces[side][move.ids[0]] = move.to;
        if (move.caught >= 0) state.pieces[1 - side][move.caught] = -1;
        if (whole(state, 14)) return complete(state, side, "All seven counters are home.");
        return takeTurn(state, move.extra ? "A rosette earns another throw." :
          move.caught >= 0 ? "The captured counter returns to reserve." : move.label, { extra: move.extra });
      },
    }),
    route: (side, pos) => urTracks[side][pos],
    board: { kind: "ur", width: 8, height: 3, cells: series(24, i => i).filter(i => ![4, 5, 20, 21].includes(i)) },
    finish: 14, names: ["Cat", "Canary"], pieces: ["disc", "disc"],
  };

  const stickRoll = random => {
    const faces = cast(4, [0, 1], random);
    return ["casting sticks", faces, sum(faces) || 5];
  };
  const senetHouse = position => position < 10 ? position : position < 20 ? 29 - position : position;
  const senet = {
    ...standard({
      start: () => initial(series(2, side => series(7, index => 1 + side + index * 2))),
      label: "Throw four casting sticks",
      roll: stickRoll,
      setup: state => state.pieces[state.turn].includes(27) && !state.pieces.some(row => row.includes(15)) ?
        [choose("rebirth", "Return to House 15")] : [],
      moves(state) {
        const side = state.turn, own = state.pieces[side], rival = state.pieces[1 - side], n = state.pending[0];
        const trapped = own.indexOf(27);
        const returnMove = from => from === 27 ? n === 4 : from === 28 ? n === 3 : from === 29 ? n === 2 : from === 30;
        const direction = step => one(own, (from, i) => {
          if (from === 31 || (trapped !== -1 && i !== trapped)) return;
          if (from >= 27) return step > 0 && returnMove(from) ?
            action("Bear off from " + from, [i], from, 31, undefined, { trapped: from === 27 }) : undefined;
          const to = from + step;
          if (to < 1 || to > 30 || (from < 26 && to > 26) || own.includes(to)) return;
          const swap = rival.indexOf(to);
          if (swap >= 0 && (to >= 28 || supports(state, 1 - side, to))) return;
          return action(from + " → " + to, [i], from, to, senetHouse(to - 1),
            { swap, weight: to === 27 ? -20 : to + (swap >= 0 ? 4 : 0) });
        });
        const forward = direction(n);
        if (forward.length) return forward;
        const back = direction(-n);
        return back.length ? back : [pass()];
      },
      play(state, move) {
        const side = state.turn;
        if (move.type === "rebirth") {
          state.pieces[side][state.pieces[side].indexOf(27)] = 15;
          return takeTurn(state, "The piece returns to the House of Rebirth.");
        }
        state.pieces[side][move.ids[0]] = move.to;
        if (move.swap >= 0) state.pieces[1 - side][move.swap] = move.from;
        if (whole(state, 31)) return complete(state, side, "All seven pieces have left the board.");
        const extra = !move.trapped && move.to !== 27 && [1, 4, 5].includes(state.pending[0]);
        return takeTurn(state, move.to === 27 ? "The piece fell into Water. The turn ends." :
          (move.swap >= 0 ? "The two pieces swap places." : move.label) + (extra ? " Throw again." : ""), { extra });
      },
    }),
    route: (_side, pos) => pos >= 1 && pos <= 30 ? senetHouse(pos - 1) : undefined,
    board: { ...cells(10, 3, series(30, i => i)), kind: "senet" },
    finish: 31, names: ["Cones", "Spools"], pieces: ["cone", "spool"],
  };

  // The two paths descend the inner rows, turn at the foot and return around the rim.
  const pegLane = [
    ...series(10, i => [.415, .255 + i * .057]),
    [.38, .826], [.324, .863], [.259, .857], [.204, .823], [.162, .772],
    [.127, .714], [.108, .653], [.099, .593], [.101, .533], [.107, .473],
    [.122, .413], [.145, .356], [.173, .305], [.207, .256], [.251, .212],
    [.303, .170], [.354, .129], [.408, .101], [.457, .083],
  ];
  const holes = [...pegLane, ...pegLane.map(([x, y]) => [1 - x, y]), [.5, .052]];
  const pegLinks = new Map([[6, 20], [8, 10]]);
  const hounds = {
    ...standard({
      start: () => initial(waiting(5, 0)), label: "Throw four casting sticks", roll: stickRoll,
      moves(state) {
        const own = state.pieces[state.turn], n = state.pending[0];
        const moves = one(own, (from, i) => {
          if ((!from && own.indexOf(0) !== i) || from === 30 || from + n > 30) return;
          const land = from + n, to = pegLinks.get(land) ?? land;
          if (to !== 30 && (own.includes(land) || own.includes(to))) return;
          return action((from === 0 ? "Enter" : "Hole " + from) + " → " + (to === 30 ? "goal" : to) +
            (land !== to ? " via " + land : ""), [i], from, to, to === 30 ? 58 : state.turn * 29 + to - 1,
            { extra: [15, 25].includes(land), weight: to + ([15, 25].includes(land) ? 4 : 0) });
        });
        return moves.length ? moves : [pass()];
      },
      play(state, move) {
        state.pieces[state.turn][move.ids[0]] = move.to;
        if (whole(state, 30)) return complete(state, state.turn, "All five pegs reached the shen.");
        return takeTurn(state, move.extra ? "A nefer hole earns an extra throw." : move.label, { extra: move.extra });
      },
    }),
    route: (side, pos) => pos > 0 && pos < 30 ? side * 29 + pos - 1 : undefined,
    board: { kind: "hounds", holes, pegLinks: [...pegLinks.entries()] },
    finish: 30, names: ["Hounds", "Jackals"], pieces: ["hound", "jackal"],
  };

  return { series, cast, sum, choose, action, copyMatch, takeTurn, complete, whole, waiting, initial, pass, lastCast, ur, senet, hounds };
})();
