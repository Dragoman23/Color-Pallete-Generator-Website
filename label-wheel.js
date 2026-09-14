const WHEEL_COLORS = [
  "#e07a5f", "#3d5a80", "#81b29a", "#f2cc8f",
  "#9b5de5", "#00bbf9", "#f15bb5", "#ef476f",
  "#06d6a0", "#118ab2", "#ffd166", "#8338ec"
];
 
let currentRotation = 0;
function polarToXY(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}
 
function buildSlice(labels, i, total, cx, cy, r) {
  const sliceAngle = 360 / total;
  const startAngle = i * sliceAngle;
  const endAngle = (i + 1) * sliceAngle;
  const midAngle = startAngle + sliceAngle / 2;
 
  const start = polarToXY(cx, cy, r, startAngle);
  const end = polarToXY(cx, cy, r, endAngle);
  const largeArc = sliceAngle > 180 ? 1 : 0;
 
  const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
 
  const textR = r * 0.62;
  const textPos = polarToXY(cx, cy, textR, midAngle);
  const flip = midAngle > 90 && midAngle < 270;
  const rotation = flip ? midAngle + 90 + 180 : midAngle - 90;
 
  return `
    <path d="${path}" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <text x="${textPos.x}" y="${textPos.y}"
          text-anchor="middle" dominant-baseline="middle"
          transform="rotate(${rotation}, ${textPos.x}, ${textPos.y})">
      ${escapeXML(labels[i])}
    </text>
  `;
}
 
function escapeXML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
 
function buildWheelInner(labels) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  return labels.map((_, i) => buildSlice(labels, i, labels.length, cx, cy, r)).join("");
}
 
function initLabelWheel(labels) {
  const wheelEl = document.getElementById("label-wheel");
 
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg">${buildWheelInner(labels)}</svg>`;
  const parsed = new DOMParser().parseFromString(svgString, "image/svg+xml");
  const parsedRoot = parsed.documentElement;
 
  wheelEl.innerHTML = "";
  Array.from(parsedRoot.childNodes).forEach(node => {
    wheelEl.appendChild(document.importNode(node, true));
  });
 
  const sliceAngle = 360 / labels.length;
 
  function spin() {
    const spinBtn = document.getElementById("spin-btn");
    spinBtn.disabled = true;
 
    const extraDegrees = Math.random() * 360;
    currentRotation += 4 * 360 + extraDegrees;
    wheelEl.style.transform = `rotate(${currentRotation}deg)`;
 
    setTimeout(() => {
      const netRotation = currentRotation % 360;
      const rawAngle = (360 - netRotation) % 360;
      const sliceIndex = Math.floor(rawAngle / sliceAngle);
      const landed = labels[sliceIndex];
 
      document.getElementById("label-result").textContent = landed;
      spinBtn.disabled = false;
    }, 4000);
  }
 
  document.getElementById("spin-btn").onclick = spin;
}
 
