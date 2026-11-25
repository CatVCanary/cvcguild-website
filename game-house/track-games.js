"use strict";

const TrackGames = (() => {
  const { series, cast, sum, choose, action, copyMatch, initial, lastCast, complete, takeTurn, pass } = RaceGames;

  function bundles(values, combine = true) {
    const seen = new Set();
    return series((1 << values.length) - 1, index => index + 1).flatMap(mask => {
      const counts = values.filter((_, index) => mask & (1 << index));
      if (!combine && counts.length > 1) return [];
      const key = counts.sort((a, b) => a - b).join(",");
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ mask, used: counts.length, n: sum(counts), counts, group: counts.join(" + ") }];
    });
  }

  function useDice(state, raw, step) {
    const choices = raw(state);
    if (!choices.length) return [pass()];
    const memo = new Map();
    function maxUsed(s) {
      if (!s.pending.length || s.winner !== null) return 0;
      const key = JSON.stringify([s.pieces, s.pending]);
      if (memo.has(key)) return memo.get(key);
      let max = 0;
      for (const choice of raw(s)) {
        const value = choice.used + maxUsed(step(s, choice));
        if (value === s.pending.length) return value;
        max = Math.max(max, value);
      }
      memo.set(key, max);
      return max;
    }
    const ranked = choices.map(move => {
      const next = step(state, move);
      return [move, next.winner === null ? move.used + maxUsed(next) : state.pending.length];
    });
    const max = Math.max(...ranked.map(([, value]) => value));
    return ranked.filter(([, value]) => value === max).map(([move]) => move);
  }

  const romanRoute = (side, progress) => {
    if (progress < 1 || progress > 30) return undefined;
    if (progress <= 6) return 12 + side * 6 + progress - 1;
    if (progress <= 18) return 18 - progress;
    return 24 + progress - 19;
  };
  const romanFinish = 31;

  function romanOptions(state) {
    const own = state.pieces[state.turn], rival = state.pieces[1 - state.turn];
    const entry = own.includes(0);
    const allAtEnd = own.every(p => p >= 25);
    const spots = [...new Set(own)].filter(position => position < romanFinish && (!entry || !position));
    return bundles(state.pending).flatMap(die => spots.flatMap(from => {
      const to = from + die.n;
      if ((from === 0 && die.used !== 1) || to > romanFinish || (to === romanFinish && !allAtEnd)) return [];
      const captured = to >= 7 && to <= 30 ? rival.flatMap((pos, i) => pos === to ? [i] : []) : [];
      if (captured.length > 1) return [];
      const label = (from === 0 ? "Enter" : "Point " + from) + " → " + (to === romanFinish ? "off" : to);
      return [action(label, [own.indexOf(from)], from, to, romanRoute(state.turn, to),
        { ...die, captured, weight: to + 10 * captured.length + (to === romanFinish ? 20 : 0) })];
    }));
  }

  function romanStep(current, move) {
    const s = copyMatch(current);
    s.pieces[s.turn][move.ids[0]] = move.to;
    for (const i of move.captured) s.pieces[1 - s.turn][i] = 0;
    s.pending = s.pending.filter((_, i) => !(move.mask & (1 << i)));
    s.notice = move.label + (move.captured.length ? " · Captured a lone counter." : "");
    if (s.pieces[s.turn].every(p => p === romanFinish)) complete(s, s.turn, "All fifteen counters are off the board.");
    return s;
  }

  const ludus = {
    start: () => initial(series(2, () => Array(15).fill(0))),
    options(state) {
      if (state.winner !== null) return [];
      if (state.phase === "cast") return [choose("cast", "Roll three dice")];
      return useDice(state, romanOptions, romanStep);
    },
    apply(current, a, random = Math.random) {
      if (a.type === "move") {
        const s = romanStep(current, a);
        return s.winner !== null || s.pending.length ? s : takeTurn(s, s.notice);
      }
      const s = copyMatch(current);
      if (a.type === "pass") return takeTurn(s, "Unused dice cannot be played.");
      const faces = cast(3, [1, 2, 3, 4, 5, 6], random);
      lastCast(s, "cube dice", faces, faces.join(" · "));
      s.phase = "move";
      s.pending = faces;
      return s;
    },
    route: romanRoute,
    board: { kind: "ludus", width: 12, height: 3, cells: series(36, i => i) },
    finish: romanFinish, names: ["Dark counters", "Light counters"], pieces: ["disc", "disc"],
  };

  const encode = ([x, y]) => y * 19 + x;
  function rotate([x, y], seat) {
    for (let i = 0; i < seat; i++) [x, y] = [y, 18 - x];
    return [x, y];
  }
  const arm = [...series(8, i => [10, 7 - i]), [9, 0], ...series(8, i => [8, i])];
  const castling = new Set(series(4, side => [[9, 0], [8, 3], [10, 3]].map(p => encode(rotate(p, side)))).flat());
  const crossCells = [...series(4, side => series(8, y => [8, 9, 10].map(x => encode(rotate([x, y], side)))).flat()).flat(), encode([9, 9])];
  const crossPaths = series(4, seat => [
    ...series(8, i => rotate([9, 7 - i], seat)),
    ...series(8, i => rotate([8, i], seat)),
    ...[1, 2, 3].flatMap(n => arm.map(p => rotate(p, (seat + n) % 4))),
    ...series(8, i => rotate([10, 7 - i], seat)),
    rotate([9, 0], seat),
    ...series(7, i => rotate([9, i + 1], seat)),
  ].map(encode));
  const home = 84, fork = 76;
  const crossRoute = (side, pos) => crossPaths[side][pos - 1];
  const team = side => side % 2;
  const colors = ["Yellow", "Red", "Black", "Green"];
  const teams = ["Yellow & Black", "Red & Green"];
  const grace = [6, 10, 25];
  const shellValue = faces => [25, 10, 2, 3, 4, 5, 6][sum(faces)];
  const crossSquare = p => "square " + p;
  const crossFinished = (s, side) => s.pieces[side].every(p => p === home);
  function crossLayout(kind) {
    return { kind, width: 19, height: 19, cells: crossCells, castles: kind === "pachisi" ? [...castling] : [],
      centers: series(4, side => series(8, i => encode(rotate([9, i], side)))) };
  }
  function crossWinner(s) {
    return crossFinished(s, s.turn) && crossFinished(s, (s.turn + 2) % 4);
  }
  function crossTurns(s, notice, extra = false) {
    return takeTurn(s, notice, { extra: extra && !crossFinished(s, s.turn), finished: side => crossFinished(s, side) });
  }
  function enemies(s, tile) {
    if (tile === undefined) return [];
    return s.pieces.flatMap((pieces, side) => team(side) === team(s.turn) ? [] :
      pieces.flatMap((p, i) => crossRoute(side, p) === tile ? [[side, i]] : []));
  }
  function crossEnd(s, move) {
    for (const i of move.ids) s.pieces[s.turn][i] = move.to;
    for (const [side, i] of move.captures) s.pieces[side][i] = 0;
    if (crossWinner(s)) complete(s, team(s.turn), "Both partners brought all eight pawns home.");
    return s;
  }
  function crossLabel(from, to, over) {
    const start = from ? "Square " + from : "Enter";
    return start + " → " + (to === home ? "home" : crossSquare(to)) + (over ? " · lap again" : "");
  }
  const pachisi = {
    start: () => ({ ...initial(series(4, () => Array(4).fill(0))), entered: [false, false, false, false] }),
    options(s) {
      if (s.winner !== null) return [];
      if (s.phase === "cast") return [choose("cast", "Throw six cowries")];
      const n = s.pending[0], own = s.pieces[s.turn];
      const moves = [...new Set(own)].flatMap(from => {
        if (from === home || (!from && s.entered[s.turn] && !grace.includes(n))) return [];
        const next = from === home - 1 ? home : from + n;
        const endings = [];
        if (next <= home) endings.push([next, false]);
        if (from && from <= fork && next > fork) endings.push([8 + next - fork, true]);
        return endings.flatMap(([to, over]) => {
          const tile = crossRoute(s.turn, to), captures = enemies(s, tile);
          if (castling.has(tile) && captures.length) return [];
          return [action(crossLabel(from, to, over), [own.indexOf(from)], from, to, tile,
            { captures, weight: to + (to === home ? 25 : 0) + captures.length * 24 + Number(castling.has(tile)) * 5 })];
        });
      });
      return moves.length ? [...moves, choose("pass", "Skip this move")] : [pass()];
    },
    apply(current, a, random = Math.random) {
      const s = copyMatch(current);
      if (a.type === "cast") {
        const faces = cast(6, [0, 1], random), n = shellValue(faces);
        lastCast(s, "cowrie shells", faces, n + (grace.includes(n) ? " · grace" : ""));
        s.pending = [n]; s.phase = "move";
        return s;
      }
      const extra = grace.includes(s.pending[0]);
      if (a.type === "pass") return crossTurns(s, extra ? "The grace still earns another throw." : "The turn passes.", extra);
      s.entered[s.turn] = true;
      crossEnd(s, a);
      if (s.winner !== null) return s;
      const again = extra || a.captures.length > 0;
      return crossTurns(s, a.captures.length ? "Captured " + a.captures.length + " · throw again." :
        a.label + (again ? " · throw again." : ""), again);
    },
    route: crossRoute, board: crossLayout("pachisi"), finish: home,
    names: colors, teams, pieces: ["pawn", "pawn", "pawn", "pawn"], palette: ["gold", "red", "black", "green"],
  };

  function chauparMoves(s) {
    const own = s.pieces[s.turn];
    return bundles(s.pending).flatMap(die => [...new Set(own)].flatMap(from => {
      const to = from + die.n;
      if (to > home || from >= home) return [];
      if (to === home && ((s.turn === 0 && !crossFinished(s, 2)) || (s.turn === 3 && !crossFinished(s, 1)))) return [];
      const group = !from ? [own.indexOf(0)] : own.flatMap((p, i) => p === from ? [i] : []);
      const tile = crossRoute(s.turn, to), captures = enemies(s, tile);
      if (captures.length) {
        const greatest = Math.max(...captures.map(([side, i]) =>
          captures.filter(([s, j]) => s === side && currentPosition(s, j) === currentPosition(side, i)).length));
        if (greatest > group.length) return [];
      }
      function currentPosition(side, i) { return s.pieces[side][i]; }
      return [action(crossLabel(from, to, false) + (group.length > 1 ? " ×" + group.length : ""), group, from, to, tile,
        { ...die, captures, weight: to + 20 * captures.length + (to === home ? 28 : 0) })];
    }));
  }
  function chauparStep(current, move) {
    const s = copyMatch(current);
    crossEnd(s, move);
    s.pending = s.pending.filter((_, i) => !(move.mask & (1 << i)));
    if (s.winner === null) s.notice = move.label + (move.captures.length ? " · Captured " + move.captures.length + "." : "");
    return s;
  }
  const chaupar = {
    start: () => initial(series(4, () => [6, 7, 23, 24])),
    options(s) {
      if (s.winner !== null) return [];
      if (s.phase === "cast") return [choose("cast", "Throw three long dice")];
      return useDice(s, chauparMoves, chauparStep);
    },
    apply(current, a, random = Math.random) {
      if (a.type === "move") {
        const s = chauparStep(current, a);
        return s.winner !== null || s.pending.length ? s : crossTurns(s, s.notice);
      }
      const s = copyMatch(current);
      if (a.type === "pass") return crossTurns(s, "Unused dice cannot be played.");
      const faces = cast(3, [1, 2, 5, 6], random);
      lastCast(s, "long dice", faces, faces.join(" · "));
      s.pending = faces; s.phase = "move";
      return s;
    },
    route: crossRoute, board: crossLayout("chaupar"), finish: home,
    names: colors, teams, pieces: ["pawn", "pawn", "pawn", "pawn"], palette: ["gold", "red", "black", "green"],
  };

  const road = [
    ...series(5, n => [5, 5 - n]), ...series(5, n => [5 - n, 0]),
    ...series(5, n => [0, n]), ...series(5, n => [n, 5]),
    [4.17, .83], [3.33, 1.67], [1.67, 3.33], [.83, 4.17],
    [.83, .83], [1.67, 1.67], [3.33, 3.33], [4.17, 4.17], [2.5, 2.5],
  ];
  const diagonal = {
    5: [20, 21, 28, 22, 23, 15],
    10: [24, 25, 28, 26, 27, 30],
    28: [26, 27, 30],
  };
  const outerNext = p => p === 19 ? 30 : p === -1 ? 1 : (p + 1) % 20;
  const tails = {
    20: [21, 28, 22, 23, 15], 21: [28, 22, 23, 15],
    22: [23, 15], 23: [15], 24: [25, 28, 26, 27, 30],
    25: [28, 26, 27, 30], 26: [27, 30], 27: [30],
  };
  const getEnd = (current, n, shortcut) => {
    const prescribed = shortcut ?? tails[current.at] ?? [];
    let at = current.at;
    for (let step = 0; step < n && at !== 30; step++) at = prescribed[step] ?? outerNext(at);
    return at;
  };
  const yutStart = () => ({ at: -1 });
  const yutFinish = 30;
  const yutNames = ["", "Do", "Gae", "Geol", "Yut", "Mo"];
  const yutLinks = [...series(20, i => [i, (i + 1) % 20]), [5,20],[20,21],[21,28],[28,22],[22,23],[23,15],[10,24],[24,25],[25,28],[28,26],[26,27],[27,0]];
  const yutMetric = at => at === -1 ? 0 : at === 30 ? 30 : at >= 20 ? 16 : at;

  const yut = {
    start: () => initial(series(2, () => series(4, yutStart))),
    options(s) {
      if (s.winner !== null) return [];
      if (s.phase === "cast") return [choose("cast", "Throw four yut sticks")];
      const own = s.pieces[s.turn], n = s.pending[0];
      return [...new Set(own.map(p => p.at))].filter(p => p !== yutFinish).flatMap(from => {
        const piece = own.findIndex(p => p.at === from);
        const route = diagonal[from];
        const destinations = [...new Set(from === 28 ? [getEnd(own[piece], n, route)] :
          [getEnd(own[piece], n, route), getEnd(own[piece], n)])];
        const ids = from === -1 ? [piece] : own.flatMap((p, i) => p.at === from ? [i] : []);
        return destinations.map((to, i) => action(
          (from === -1 ? "Enter" : "Point " + from) + " → " + (to === yutFinish ? "home" : "point " + to) +
          (route ? i === 0 ? " · shortcut" : " · outer path" : "") + (ids.length > 1 ? " ×" + ids.length : ""),
          ids, from, to, to === yutFinish ? 0 : to,
          { 
            captured: s.pieces[1 - s.turn].filter(p => p.at === to && to !== yutFinish).length,
            weight: yutMetric(to) + (route && i === 0 ? 5 : 0) + (to === yutFinish ? 15 : 0),
          }));
      });
    },
    apply(current, a, random = Math.random) {
      const s = copyMatch(current);
      if (a.type === "cast") {
        const faces = cast(4, [0, 1], random), n = sum(faces) || 5;
        lastCast(s, "yut sticks", faces, yutNames[n] + " · " + n);
        s.pending = [n]; s.phase = "move";
        return s;
      }
      for (const i of a.ids) s.pieces[s.turn][i] = { at: a.to };
      if (a.captured) s.pieces[1 - s.turn] = s.pieces[1 - s.turn].map(p => p.at === a.to ? yutStart() : p);
      if (s.pieces[s.turn].every(p => p.at === yutFinish)) return complete(s, s.turn, "All four mal have completed their route.");
      const extra = a.captured > 0 || s.pending[0] >= 4;
      return takeTurn(s, a.captured ? "Capture · throw again." : a.label + (extra ? " · throw again." : ""), { extra });
    },
    route: (_side, p) => p.at >= 0 && p.at < yutFinish ? p.at : undefined,
    board: { kind: "yut", road, links: yutLinks },
    finish: yutFinish, names: ["Crimson", "Gold"], pieces: ["mal", "mal"],
  };

  return { ludus, pachisi, chaupar, yut };
})();
