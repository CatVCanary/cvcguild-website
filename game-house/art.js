"use strict";

const GameArt = (() => {
  const inks = { dark: "#291a15", red: "#74252a", ivory: "#ebd9a7", gold: "#dea753" };

  function random(seed) {
    let value = seed;
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function line(c, x, y, toX, toY) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(toX, toY);
    c.stroke();
  }

  function star(c, x, y, size, color) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x, y - size);
    c.quadraticCurveTo(x + 1, y - 1, x + size, y);
    c.quadraticCurveTo(x + 1, y + 1, x, y + size);
    c.quadraticCurveTo(x - 1, y + 1, x - size, y);
    c.quadraticCurveTo(x - 1, y - 1, x, y - size);
    c.fill();
  }

  function background(c, w, h, shades, seed) {
    const gradient = c.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.8);
    gradient.addColorStop(0, shades[0]);
    gradient.addColorStop(1, shades[1]);
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);
    const roll = random(seed);
    for (let i = 0; i < w * h / 16; i++) {
      const tone = roll();
      c.fillStyle = tone > .53 ? "rgba(31,16,7,.15)" : "rgba(255,237,190,.19)";
      c.fillRect(roll() * w, roll() * h, .45 + roll() * 2, .5 + roll());
    }
    c.strokeStyle = shades[2];
    c.lineWidth = 1;
    c.strokeRect(11, 11, w - 22, h - 22);
    c.strokeRect(16, 16, w - 32, h - 32);
    for (const [x, y] of [[37, 33], [w - 37, 33], [37, h - 33], [w - 37, h - 33]]) {
      star(c, x, y, 9, shades[2]);
    }
  }

  function morrisLines(c, size, margin) {
    const unit = (size - 2 * margin) / 6;
    for (const [i, j] of Morris.links.flatMap((links, i) => links.filter(j => i < j).map(j => [i, j]))) {
      const [x, y] = Morris.points[i];
      const [tx, ty] = Morris.points[j];
      line(c, margin + x * unit, margin + y * unit, margin + tx * unit, margin + ty * unit);
    }
    for (const [x, y] of Morris.points) {
      c.beginPath();
      c.arc(margin + x * unit, margin + y * unit, size / 107, 0, 2 * Math.PI);
      c.fill();
    }
  }

  function disc(c, x, y, radius, color) {
    c.fillStyle = "#291810";
    c.beginPath();
    c.ellipse(x + 2, y + 4, radius + .5, radius + .5, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = color;
    c.strokeStyle = "#3d2317";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = "rgba(255,238,190,.6)";
    c.beginPath();
    c.arc(x, y, radius * .68, 0, Math.PI * 2);
    c.stroke();
    star(c, x, y, radius / 2, color === inks.red ? inks.ivory : inks.dark);
  }

  function feature(c, w, h) {
    background(c, w, h, ["#854339", "#4a2321", "#c49256"], 919);
    c.save();
    c.translate(w * .52, h * .50);
    c.rotate(-.09);
    c.fillStyle = "#32191399";
    c.fillRect(-122, -117, 254, 254);
    c.fillStyle = "#a16c3b";
    c.strokeStyle = "#29180f";
    c.lineWidth = 3;
    c.fillRect(-128, -128, 256, 256);
    c.strokeRect(-128, -128, 256, 256);
    c.translate(-120, -120);
    background(c, 240, 240, ["#edd6a2", "#bb8b55", "#644125"], 11);
    c.fillStyle = c.strokeStyle = inks.dark;
    c.lineWidth = 2;
    morrisLines(c, 240, 33);
    for (const [i, color] of [[0, inks.red], [1, inks.red], [2, inks.red], [5, inks.gold], [6, inks.gold], [9, inks.gold], [15, inks.red], [16, inks.gold], [19, inks.red], [20, inks.gold]]) {
      const [x, y] = Morris.points[i];
      disc(c, 33 + x * 29, 33 + y * 29, 9.2, color);
    }
    c.restore();
    for (const [x, y, r] of [[.205, .46, 17], [.177, .61, 14], [.228, .67, 16], [.824, .35, 17], [.86, .46, 15], [.81, .54, 18]]) {
      disc(c, w * x, h * y, r, x > .5 ? inks.gold : inks.red);
    }
  }

  function rosette(c, x, y, radius) {
    for (let j = 0; j < 8; j++) {
      const direction = Math.PI * j / 4;
      c.fillStyle = inks.ivory;
      c.beginPath();
      c.ellipse(x + radius * .52 * Math.cos(direction), y + radius * .52 * Math.sin(direction),
        radius * .39, radius * .19, direction, 0, 2 * Math.PI);
      c.fill();
    }
    star(c, x, y, radius * .37, "#b3723c");
  }

  function ur(c, w, h) {
    background(c, w, h, ["#eed398", "#ba8c51", "#79532b"], 289);
    c.save();
    const size = 42;
    c.translate(w * .49, h * .45);
    c.rotate(-.095);
    c.translate(-size * 4, -size * 1.25);
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 3; row++) {
        if ((col === 4 || col === 5) && row !== 1) continue;
        const x = col * size;
        const y = row * size;
        const isRosette = (col === 0 || col === 6) && row !== 1 || col === 3 && row === 1;
        c.fillStyle = isRosette ? "#532c23" : (row + col) % 2 ? "#eddcb7" : "#d2ae78";
        c.strokeStyle = "#41291b";
        c.lineWidth = 2.4;
        c.fillRect(x, y, size, size);
        c.strokeRect(x, y, size, size);
        c.lineWidth = .7;
        c.strokeRect(x + 3, y + 3, size - 6, size - 6);
        if (isRosette) {
          rosette(c, x + size / 2, y + size / 2, size * .38);
        } else {
          for (const [dx, dy] of [[.3,.3],[.7,.3],[.5,.5],[.3,.7],[.7,.7]]) {
            c.strokeStyle = "#70553b";
            c.beginPath();
            c.arc(x + size * dx, y + size * dy, size * .07, 0, 2 * Math.PI);
            c.stroke();
          }
        }
      }
    }
    c.restore();
    for (let i = 0; i < 4; i++) {
      const x = w * .60 + i * 24;
      const y = h * .74 + (i % 2) * 13;
      c.fillStyle = "#75513b";
      c.strokeStyle = "#442a1d";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y - 12); c.lineTo(x - 9, y + 8); c.lineTo(x + 9, y + 5); c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = "#f3dfb3";
      c.beginPath(); c.arc(x, y - 6, 2.2, 0, 2 * Math.PI); c.fill();
    }
  }

  function senet(c, w, h) {
    background(c, w, h, ["#f0d8aa", "#bf925d", "#7f4d25"], 89);
    c.save();
    c.translate(w * .50, h * .46);
    c.rotate(-.105);
    c.translate(-175, -51);
    c.fillStyle = "#77472e";
    c.fillRect(-10, -9, 370, 133);
    c.fillStyle = "#aa794a";
    c.fillRect(-9, 107, 368, 13);
    c.fillStyle = "#edce96";
    c.strokeStyle = "#4b3020";
    c.lineWidth = 2;
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 3; y++) {
        c.fillRect(x * 35, y * 35, 35, 35);
        c.strokeRect(x * 35, y * 35, 35, 35);
      }
    }
    c.strokeStyle = "#694129";
    for (const x of [5, 6, 7, 8, 9]) {
      if (x === 6) {
        for (let offset = 0; offset <= 10; offset += 5) {
          c.beginPath();
          for (let j = 0; j < 7; j++) {
            const posX = x * 35 + 8 + j * 3;
            const posY = 80 + offset + (j % 2) * 2;
            if (!j) c.moveTo(posX, posY); else c.lineTo(posX, posY);
          }
          c.stroke();
        }
      } else {
        const count = x === 5 || x === 9 ? 1 : 10 - x;
        for (let j = 0; j < count; j++) {
          const pos = x * 35 + 17 + (j - (count - 1) / 2) * 5;
          line(c, pos, 79, pos, 94);
        }
      }
    }
    for (const [col, row, cone] of [[1,0,1],[2,0,0],[3,0,1],[4,0,0],[5,0,1],[2,1,0],[4,1,1],[6,1,0]]) {
      const x = col * 35 + 17;
      const y = row * 35 + 23;
      c.strokeStyle = "#4b2b18";
      c.fillStyle = cone ? "#854030" : "#f3dfae";
      c.beginPath();
      c.moveTo(x - 9, y + 4); c.lineTo(x - (cone ? 2 : 6), y - 12);
      c.quadraticCurveTo(x, y - 15, x + (cone ? 2 : 6), y - 12);
      c.lineTo(x + 9, y + 4); c.quadraticCurveTo(x, y + 9, x - 9, y + 4);
      c.fill(); c.stroke();
    }
    c.restore();
    c.save();
    c.translate(w * .57, h * .77);
    c.rotate(.19);
    for (let i = 0; i < 4; i++) {
      c.fillStyle = i % 2 ? "#f0d49d" : "#75432b";
      c.strokeStyle = "#42291b";
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(30, i * 9, 44, 3, i * -.035, 0, Math.PI * 2);
      c.fill(); c.stroke();
    }
    c.restore();
  }

  function drawBoard(canvas) {
    const c = canvas.getContext("2d");
    const size = canvas.width;
    c.strokeStyle = "#8f532d";
    c.lineWidth = 2;
    c.strokeRect(12, 12, size - 24, size - 24);
    c.strokeStyle = c.fillStyle = "#462b1b";
    c.lineWidth = 3;
    morrisLines(c, size, size * .077);
    for (const [x, y] of [[28, 28], [572, 28], [28, 572], [572, 572], [300, 300]]) {
      star(c, x, y, 9, "#895932");
    }
  }

  function printPlate(canvas, kind) {
    const draw = { morris: feature, ur, senet }[kind];
    draw(canvas.getContext("2d"), canvas.width, canvas.height);
  }

  function captureCue(layer, status) {
    const duration = 2400;
    let timer;

    function clear() {
      clearTimeout(timer);
      layer.replaceChildren();
      status.textContent = "";
    }

    function show(spots, message) {
      clear();
      for (const { left, top, size } of spots) {
        const mark = document.createElement("span");
        mark.className = "capture-marker";
        mark.style.left = left;
        mark.style.top = top;
        if (size) mark.style.width = `clamp(24px, ${size}, 56px)`;
        mark.style.animationDuration = duration + "ms";
        layer.append(mark);
      }
      status.textContent = message;
      timer = setTimeout(clear, duration);
    }

    return { show, clear };
  }

  return { drawBoard, printPlate, captureCue };
})();
