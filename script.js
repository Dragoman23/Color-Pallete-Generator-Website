const MODES = {
    random: {label: "Random", describe: "Randomly selects hues, constrained saturation/lightness."},
    analogous: {label: "Analogous", describe: "Selects hues that are close together on the wheel, about 30 degrees apart, colors are calm and cohesive."},
    complementary: {label: "Complementary", describe: "Selects hues that are opposite on the color wheel, 180 degrees apart, colors are highly contrasting."},
    triadic: {label: "Triadic", describe: "Selects colors that are evenly spaced around the wheel, 120 degrees apart, colors are vibrant and balanced."},
    monochrome:  {label: "Monochrome", describe: "One hue, colors only vary in saturation/lightness, colors are very cohesive"}
};

const COUNT = 5;
let mode = "random";
let locked = Array(COUNT).fill(false);
let colors = [];

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) %12;
    const a = s * Math.min(l, 1-l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) -3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function contrastText(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.55 ? "#111111" : '#f5f5f5';
}

function generatePalette() {
    const baseHue = randRange(0, 360);
    let hues = [];

    if (mode === "random") {
        hues = Array.from({length: COUNT }, () => randRange(0, 360));
    } else if (mode === "monochrome"){
        hues = Array.from({length: COUNT }, () => baseHue);
    } else if (mode === "analogous") {
        const spread = 30;
        hues = Array.from({length: COUNT }, (_, i) => (baseHue + ( i - COUNT / 2) * spread + 360) % 360);
    } else if (mode === "complementary") {
        hues = Array.from({length: COUNT }, (_,i) => (i % 2 === 0 ? baseHue : (baseHue + 180) % 360));
    } else if (mode === "triadic") {
        hues = Array.from({length: COUNT }, (_,i) => (baseHue + (i % 3) * 120) % 360);
    }
    
    colors = hues.map((h, i) => {
        if (locked[i] && colors[i]) return colors[i];
        const s = mode === "monochrome" ? randRange(35, 90) : randRange(45, 85);
        const l = mode === "monochrome" ? randRange(20, 85) : randRange(35, 75);
        return hslToHex( h, s, l);
    });
}

function renderModes() {
    const container = document.getElementById("modes");
    container.innerHTML = "";
    Object.entries(MODES).forEach(([key, m]) => {
        const btn = document.createElement("button");
        btn.className = "mode-btn" + (mode === key ? "active" : "");
        btn.textContent = m.label;
        btn.title = m.describe;
        btn.onclick = () => { mode=key; renderModes(); regenerate(); };
        container.appendChild(btn);
    });
    document.getElementById("mode-desc").textContent = MODES[mode].describe;
}

function renderSwatches() {
    const container = document.getElementById("swatches");
    container.innerHTML = "";
    colors.forEach((hex, i) => {
        const div = document.createElement("div");
        div.className = "swatch";
        div.style.backgroundColor = hex;
        const textColor = contrastText(hex);

        const lockBtn = document.createElement("button");
        lockBtn.className = "lock-btn";
        lockBtn.style.color = textColor;
        lockBtn.textContent = locked[i] ? "UNLOCK" : "LOCK";
        lockBtn.setAttribute("aria-label", locked[i] ? "Unlock color": "Lock color");
        lockBtn.onclick = () => { locked[i] = !locked[i]; renderSwatches(); };

        const hexBtn = document.createElement("button");
        hexBtn.className = "hex-btn";
        hexBtn.style.color = textColor;
        hexBtn.textContent = hex.toUpperCase();
        hexBtn.onclick = () => {
            navigator.clipboard?.writeText(hex).catch(() => {});
            hexBtn.textContent = "Copied!"
            setTimeout(() => { hexBtn.textContent = hex.toUpperCase(); }, 1000);
        };

        div.appendChild(lockBtn);
        div.appendChild(hexBtn);
        container.appendChild(div);
    });
}

function regenerate() {
    generatePalette();
    renderSwatches();
    document.getElementById("mode-desc").textContent = MODES[mode].describe;
}

document.getElementById("generate").onclick = regenerate;

window.addEventListener("keydown", e => {
    if (e.code === "Space") {
        e.preventDefault();
        regenerate();
    }
})

renderModes();
regenerate();