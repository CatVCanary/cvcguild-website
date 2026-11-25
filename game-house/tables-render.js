"use strict";

const TableArt = (() => {
  const swatches = {
    red: ["#842834", "#f3d69f"], gold: ["#e9b55b", "#482e18"],
    black: ["#332b26", "#fff0cb"], green: ["#315c45", "#f6e4b6"],
    ivory: ["#ede0bc", "#48311c"],
  };
  const numberRoman = n => ({ 1: "I", 3: "III", 4: "IV", 6: "VI" }[n]);

  function counters(spec) {
    return spec.palette ?? (spec.board.kind === "ur" || spec.board.kind === "ludus" ? ["black", "ivory"] : ["red", "gold"]);
  }
  function line(c, x, y, x2, y2) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
  }
  function circle(c, x, y, radius, color, stroke) {
    c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2);
    if (color) { c.fillStyle = color; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }
  function label(c, value, x, y, size, color = "#442a19", weight = "600") {
    c.fillStyle = color;
    c.font = weight + " " + size + "px Georgia, serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(value, x, y);
  }
  function flower(c, x, y, r, color) {
    c.fillStyle = color;
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * i / 4;
      c.beginPath(); c.ellipse(x + r * .50 * Math.cos(a), y + r * .50 * Math.sin(a), r * .42, r * .16, a, 0, Math.PI * 2); c.fill();
    }
    circle(c, x, y, r * .14, color);
  }

  function token(c, x, y, size, color, kind, count, returned) {
    const [face, ink] = swatches[color];
    c.save(); c.translate(x, y);
    const r = size * .46;
    c.fillStyle = "#2e190f65";
    c.beginPath(); c.ellipse(1, r * .68, r * 1.06, r * .30, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#372415"; c.lineWidth = Math.max(1, size * .055);
    c.fillStyle = face;
    if (kind === "cone" || kind === "pawn") {
      c.beginPath();
      c.moveTo(-r, r * .48); c.lineTo(-r * .21, -r * .63);
      c.quadraticCurveTo(0, -r * 1.13, r * .21, -r * .63);
      c.lineTo(r, r * .48); c.quadraticCurveTo(0, r * 1.17, -r, r * .48);
      c.closePath(); c.fill(); c.stroke();
      line(c, -r * .69, r * .40, r * .65, r * .40);
    } else if (kind === "spool") {
      c.beginPath();
      c.moveTo(-r, -r * .65); c.lineTo(r, -r * .65); c.lineTo(r, -r * .25);
      c.lineTo(r * .4, -r * .21); c.lineTo(r * .4, r * .23); c.lineTo(r, r * .30);
      c.lineTo(r, r * .67); c.lineTo(-r, r * .67); c.lineTo(-r, r * .30);
      c.lineTo(-r * .4, r * .23); c.lineTo(-r * .4, -r * .21); c.lineTo(-r, -r * .25);
      c.closePath(); c.fill(); c.stroke();
    } else if (kind === "hound" || kind === "jackal") {
      c.beginPath();
      c.moveTo(-r * .27, r); c.lineTo(-r * .29, -r * .05);
      if (kind === "jackal") {
        c.lineTo(-r * .48, -r * .88); c.lineTo(-r * .08, -r * .58);
        c.lineTo(r * .17, -r * 1.04); c.lineTo(r * .35, -r * .50);
      } else c.quadraticCurveTo(-r * .48, -r * .98, r * .2, -r * .70);
      c.lineTo(r * .96, -r * .18); c.lineTo(r * .81, r * .06);
      c.lineTo(r * .21, r * .11); c.lineTo(r * .23, r);
      c.closePath(); c.fill(); c.stroke();
      circle(c, r * .28, -r * .35, r * .095, ink);
    } else {
      circle(c, 0, 0, r, face, "#362416");
      c.lineWidth = Math.max(1, size * .035);
      circle(c, 0, 0, r * .72, null, ink);
      if (kind === "disc") flower(c, 0, 0, r * .49, ink);
      else circle(c, 0, 0, r * .25, ink);
    }
    if (returned) {
      c.strokeStyle = ink; c.lineWidth = 2.5;
      line(c, -r * .48, r * .45, r * .52, -r * .45);
    }
    if (count > 1) {
      const badge = Math.max(6, r * .62);
      c.lineWidth = 1.35; circle(c, r * .64, -r * .61, badge, "#fff2cf", "#412c1d");
      label(c, count, r * .64, -r * .61 + .5, badge * 1.42);
    }
    c.restore();
  }

  function inlay(c, pos, step, kind) {
    const { x, y, size } = pos;
    const fw = size / 2;
    c.fillStyle = step % 2 === 0 ? "#f3db9e" : "#e9c486";
    if (kind === "ur") c.fillStyle = (step % 3 === 0 ? "#e6cb97" : step % 3 === 1 ? "#ecdab0" : "#cda976");
    if (kind === "ludus") c.fillStyle = step % 2 === 0 ? "#eee0b5" : "#e5c692";
    c.fillRect(x - fw, y - fw, size, size);
    c.lineWidth = 1.7; c.strokeStyle = "#6c4629";
    c.strokeRect(x - fw, y - fw, size, size);
    c.lineWidth = 1; c.strokeStyle = "#b58248";
    c.strokeRect(x - fw + 3, y - fw + 3, size - 6, size - 6);
  }

  function grid(c, table, spec) {
    const { width, height, cells, kind } = table;
    const size = kind === "ludus" ? 48 : kind === "ur" ? 77 : 64;
    const pad = 22;
    const layout = { width: size * width + 2 * pad, height: size * height + 2 * pad, positions: new Map() };
    for (const point of cells) {
      const x = pad + ((point % width) + .5) * size;
      const y = pad + (Math.floor(point / width) + .5) * size;
      layout.positions.set(point, { x, y, size });
      inlay(c, { x, y, size }, point, kind);
      if (kind === "ur") {
        if ([0, 6, 11, 16, 22].includes(point)) {
          c.fillStyle = "#7b3330"; c.fillRect(x - size * .37, y - size * .37, size * .74, size * .74);
          flower(c, x, y, size * .28, "#f3d88f");
        } else {
          for (const [dx, dy] of [[-.22,-.22],[.22,-.22],[0,0],[-.22,.22],[.22,.22]]) {
            c.lineWidth = 1; circle(c, x + size * dx, y + size * dy, size * .063, null, "#81542e");
          }
        }
      }
      let routeNumber = null;
      if (kind === "senet") routeNumber = point >= 10 && point < 20 ? 30 - point : point + 1;
      if (kind === "ludus") routeNumber = point < 12 ? 18 - point : point < 24 ? (point - 12) % 6 + 1 : point - 5;
      if (kind === "ur") {
        const side = point >= 16 ? 1 : 0;
        routeNumber = RaceGames.series(14, p => p).find(p => spec.route(side, p) === point) + 1;
      }
      label(c, routeNumber, x - size * .31, y - size * .31, size * .175, [0,6,11,16,22].includes(point) && kind === "ur" ? "#754412" : "#54361f");
      if (kind === "senet" && routeNumber >= 15) {
        const signs = { 15: "↺", 26: "◉", 27: "≈", 28: "III", 29: "II", 30: "I" };
        if (signs[routeNumber]) label(c, signs[routeNumber], x, y + size * .03, size * .37, routeNumber === 27 ? "#275063" : "#7f3c2f");
      }
    }
    if (kind === "ludus") {
      c.strokeStyle = "#633723"; c.lineWidth = 4;
      line(c, layout.width / 2, pad, layout.width / 2, layout.height - pad);
    }
    layout.token = size * .61;
    return layout;
  }
  function cross(c, board) {
    const size = 29, pad = 15, width = size * board.width + pad * 2;
    const layout = { width, height: width, token: size * .82, positions: new Map() };
    c.fillStyle = "#672e25";
    c.fillRect(pad - 5, pad - 5, width - (pad - 5) * 2, width - (pad - 5) * 2);
    const centers = new Map(board.centers.flatMap((cells, side) => cells.map(cell => [cell, side])));
    const castleSet = new Set(board.castles);
    for (const point of board.cells) {
      const x = pad + (point % 19 + .5) * size, y = pad + (Math.floor(point / 19) + .5) * size;
      layout.positions.set(point, { x, y, size });
      if (point === 180) {
        c.fillStyle = "#eac88b"; c.fillRect(x - 1.5 * size, y - 1.5 * size, 3 * size, 3 * size);
        c.strokeStyle = "#4e2f20"; c.lineWidth = 2.5;
        c.strokeRect(x - 1.5 * size, y - 1.5 * size, 3 * size, 3 * size);
        flower(c, x, y, size * 1.00, "#6e3826");
        continue;
      }
      const tint = ["#ecd19a", "#e2ac93", "#bbb3a2", "#b9c5a3"][centers.get(point)];
      c.fillStyle = tint ?? "#f2ddae"; c.fillRect(x - size / 2, y - size / 2, size, size);
      c.lineWidth = 1.45; c.strokeStyle = "#5a3828";
      c.strokeRect(x - size / 2, y - size / 2, size, size);
      if (castleSet.has(point)) {
        c.strokeStyle = "#754228"; c.lineWidth = 2.5;
        line(c, x - 7, y - 7, x + 7, y + 7); line(c, x + 7, y - 7, x - 7, y + 7);
      }
    }
    return layout;
  }

  function pegs(c, board) {
    const width = 456, height = 489;
    const positions = new Map(board.holes.map(([x, y], i) => [i, { x: 25 + x * 406, y: 21 + y * 450, size: 21 }]));
    c.fillStyle = "#b78350"; c.strokeStyle = "#4b2a1a"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(228, 19);
    c.bezierCurveTo(195, 52, 73, 97, 45, 190);
    c.bezierCurveTo(15, 281, 34, 436, 117, 451);
    c.quadraticCurveTo(228, 475, 339, 451);
    c.bezierCurveTo(422, 436, 441, 281, 411, 190);
    c.bezierCurveTo(383, 97, 261, 52, 228, 19);
    c.fill(); c.stroke();
    const shen = positions.get(58);
    c.lineWidth = 4; circle(c, shen.x, shen.y, 14, "#ecc98e", "#5c341d");
    c.strokeStyle = "#704723"; c.lineWidth = 2;
    line(c, 228, 109, 228, 405);
    for (const direction of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        c.beginPath(); c.moveTo(228, 112 + i * 11);
        c.quadraticCurveTo(228 + direction * (16 + 6 * i), 87 + i * 4, 228 + direction * (29 + 4 * i), 127 + i * 17);
        c.stroke();
      }
    }
    for (let side = 0; side < 2; side++) {
      for (const [from, to] of board.pegLinks) {
        const a = positions.get(side * 29 + from - 1), b = positions.get(side * 29 + to - 1);
        c.strokeStyle = "#624027"; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo((a.x + b.x) / 2, b.y + 10, b.x, b.y); c.stroke();
      }
    }
    for (const [i, { x, y }] of positions) {
      const special = i !== 58 && [14, 24].includes(i % 29);
      if (i < 58) {
        const side = Math.floor(i / 29), hole = 1 + i % 29;
        if ([1, 6, 8, 10, 15, 20, 25, 29].includes(hole)) {
          label(c, hole, x + (side ? 10 : -10), y + (hole === 29 ? 10 : 1), 10, "#382518");
        }
      }
      const radius = i === 58 ? 8 : special ? 6 : 4.3;
      circle(c, x, y, radius, special ? "#f6d48e" : "#35231a", special ? "#472d19" : null);
    }
    return { width, height, token: 22, positions };
  }

  function yut(c, board) {
    const width = 520, pad = 34, step = (width - pad * 2) / 5;
    const positions = new Map(board.road.map(([x, y], i) => [i, { x: pad + x * step, y: pad + y * step, size: 43 }]));
    c.strokeStyle = "#744727"; c.lineWidth = 3;
    for (const [a, b] of board.links) {
      const from = positions.get(a), to = positions.get(b);
      line(c, from.x, from.y, to.x, to.y);
    }
    for (const [i, { x, y }] of positions) {
      c.lineWidth = 3;
      const special = [0, 5, 10, 15, 28].includes(i);
      circle(c, x, y, special ? 15 : 8, special && i !== 0 ? "#d7a551" : "#ffebbd", "#59341e");
      if (i === 0 || i === 28) flower(c, x, y, 9, "#774920");
      if (i === 0) label(c, "HOME", x - 29, y + 26, 10);
      else if (i < 20 && special) label(c, i, x, y, 12);
    }
    return { width, height: width, token: 33, positions };
  }
  function sizeOf(table) {
    if (["ur", "senet", "ludus"].includes(table.kind)) {
      const size = table.kind === "ludus" ? 48 : table.kind === "ur" ? 77 : 64;
      return [size * table.width + 44, size * table.height + 44];
    }
    if (table.kind === "hounds") return [456, 489];
    if (table.kind === "yut") return [520, 520];
    return [581, 581];
  }
  function board(canvas, spec, state, choices, selected) {
    const table = spec.board;
    const [width, height] = sizeOf(table);
    canvas.width = width; canvas.height = height;
    const c = canvas.getContext("2d");
    const fog = c.createRadialGradient(width * .47, height * .42, width * .15, width * .48, height * .40, width * .65);
    fog.addColorStop(0, "#f0dbac"); fog.addColorStop(1, "#c09053");
    c.fillStyle = fog; c.fillRect(0, 0, width, height);
    c.strokeStyle = "#925d35"; c.lineWidth = 2; c.strokeRect(8, 8, width - 16, height - 16);
    const frame = table.kind === "hounds" ? pegs(c, table) : table.kind === "yut" ? yut(c, table) :
      table.kind === "pachisi" || table.kind === "chaupar" ? cross(c, table) : grid(c, table, spec);
    const colors = counters(spec);
    const spots = new Map();
    for (const [side, row] of state.pieces.entries()) {
      for (const position of row) {
        const tile = spec.route(side, position);
        if (tile === undefined) continue;
        const key = side + ":" + tile + ":" + Number((table.kind === "pachisi" || table.kind === "chaupar") && position > 76);
        const group = spots.get(key) ?? { side, tile, position, count: 0 };
        group.count++;
        spots.set(key, group);
      }
    }
    const available = [...new Set(choices.map(a => a.tile).filter(tile => tile !== undefined))];
    for (const tile of available) {
      const point = frame.positions.get(tile);
      if (!point) continue;
      c.lineWidth = tile === selected ? 5 : 2.6;
      circle(c, point.x, point.y, point.size * .43, tile === selected ? "#ffedb59f" : "#fef0b960", "#792c28");
    }
    for (const group of spots.values()) {
      const { x, y } = frame.positions.get(group.tile);
      const peers = [...spots.values()].filter(item => item.tile === group.tile);
      const offset = (peers.indexOf(group) - (peers.length - 1) / 2) * frame.token * .40;
      token(c, x + offset, y + (peers.length > 1 ? 3 : 0), frame.token, colors[group.side],
        spec.pieces[group.side], group.count, (table.kind === "pachisi" || table.kind === "chaupar") && group.position > 76);
    }
    return frame;
  }

  return { board, counters, numberRoman };
})();
