"use strict";

const Morris = (() => {
  const ring = [[0, 0], [3, 0], [6, 0], [6, 3], [6, 6], [3, 6], [0, 6], [0, 3]];
  const points = [0, 1, 2].flatMap(inset => ring.map(([x, y]) => [
    x === 3 ? x : x === 0 ? inset : 6 - inset,
    y === 3 ? y : y === 0 ? inset : 6 - inset,
  ]));
  const mills = [
    ...[0, 8, 16].flatMap(first => [0, 2, 4, 6].map(offset => [
      first + offset, first + offset + 1, first + (offset + 2) % 8,
    ])),
    ...[1, 3, 5, 7].map(first => [first, first + 8, first + 16]),
  ];
  const links = points.map((_, point) => [...new Set(mills.flatMap(line => {
    const i = line.indexOf(point);
    return i < 0 ? [] : [line[i - 1], line[i + 1]].filter(node => node !== undefined);
  }))]);

  function start() {
    return {
      board: Array(24).fill(null), reserve: [9, 9], turn: 0,
      capture: false, winner: null, quiet: 0, seen: {},
    };
  }

  function onBoard(board, side) {
    return board.flatMap((piece, point) => piece === side ? [point] : []);
  }

  function isMill(board, point, side) {
    return mills.some(line => line.includes(point) && line.every(node => board[node] === side));
  }

  function legal(state) {
    if (state.winner !== null) return [];
    const { board, reserve, turn, capture } = state;
    if (capture) {
      const rivals = onBoard(board, 1 - turn);
      const exposed = rivals.filter(point => !isMill(board, point, 1 - turn));
      return (exposed.length ? exposed : rivals).map(at => ({ kind: "take", at }));
    }
    const free = onBoard(board, null);
    if (reserve[turn] > 0) return free.map(to => ({ kind: "place", to }));
    const pieces = onBoard(board, turn);
    if (pieces.length < 3) return [];
    return pieces.flatMap(from => {
      const destinations = pieces.length === 3 ? free : links[from].filter(to => board[to] === null);
      return destinations.map(to => ({ kind: "move", from, to }));
    });
  }

  function apply(state, action) {
    const allowed = legal(state).some(move => move.kind === action.kind &&
      move.from === action.from && move.to === action.to && move.at === action.at);
    if (!allowed) return state;
    const next = { ...state, board: [...state.board], reserve: [...state.reserve] };
    const { turn } = next;
    if (action.kind === "take") {
      next.board[action.at] = null;
      next.quiet = 0;
      next.seen = {};
      next.capture = false;
    } else {
      if (action.kind === "move") {
        next.board[action.from] = null;
        next.quiet++;
      } else {
        next.reserve[turn]--;
      }
      next.board[action.to] = turn;
      if (isMill(next.board, action.to, turn) && next.board.includes(1 - turn)) {
        next.capture = true;
        return next;
      }
    }

    next.turn = 1 - turn;
    if (!next.reserve[next.turn] && !legal(next).length) {
      next.winner = turn;
    } else if (next.reserve.every(count => count === 0)) {
      const key = next.turn + ":" + next.board.map(piece => piece ?? "-").join("");
      const visits = (next.seen[key] ?? 0) + 1;
      next.seen = { ...next.seen, [key]: visits };
      if (visits >= 3 || next.quiet >= 50) next.winner = "draw";
    }
    return next;
  }

  function evaluate(state, side) {
    if (state.winner === side) return 1000;
    if (state.winner === 1 - side) return -1000;
    if (state.winner === "draw") return 0;
    function strength(player) {
      const stones = onBoard(state.board, player);
      const lines = mills.reduce((score, line) => {
        const occupants = line.map(point => state.board[point]);
        if (occupants.includes(1 - player)) return score;
        const count = occupants.filter(piece => piece === player).length;
        return score + [0, .3, 3.5, 4][count];
      }, 0);
      return (stones.length + state.reserve[player]) * 15 + lines +
        stones.reduce((score, point) => score + links[point].length * .13, 0);
    }
    return strength(side) - strength(1 - side);
  }

  function outcomes(state) {
    return legal(state).map(action => {
      const after = apply(state, action);
      const positions = after.capture ? legal(after).map(take => apply(after, take)) : [after];
      return { action, positions };
    });
  }

  function choose(state) {
    const side = state.turn;
    let best;
    let bestScore = -Infinity;
    for (const { action, positions } of outcomes(state)) {
      const score = Math.max(...positions.map(position => {
        const replies = position.turn === side ? [] : outcomes(position);
        const immediate = evaluate(position, side);
        return replies.length ? .28 * immediate + .72 * Math.min(...replies.flatMap(reply =>
          reply.positions.map(result => evaluate(result, side)))) : immediate;
      }));
      if (score > bestScore) {
        bestScore = score;
        best = action;
      }
    }
    return best;
  }

  return { start, points, mills, links, onBoard, legal, apply, choose };
})();
