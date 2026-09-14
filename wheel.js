function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9-k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function contrastText(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.55 ? '#111111' : "#f5f5f5";
}

const HARMONIES = {
    complementary: {
        label: "Complementary",
        getHues: base => [base, (base + 180) % 360]
    },

    triadic: {
        label: "Triadic",
        getHues: base => [base, (base + 120) % 360, (base + 240) % 360]
    },

    analogous: {
        label: "Two Analogous",
        getHues: base => [(base - 30 + 360) % 360, base, (base + 30) % 360]
    },

    monochrome: {
        label: "Two Monochrome",
        getHues: base => [base, base, base] // Varying saturation and lightness rather than the hue
    }
};

let currentHue = 0;
let currentRotation = 0;
let harmonyMode = "complementary"

const SLICE_COUNT = 12;
function buildWheelGradient() {
    const sliceSize = 360 / SLICE_COUNT;
    const stops = [];
    for (let i = 0; i < SLICE_COUNT; i++) {
        const hue = i * sliceSize;
        const start = i * sliceSize;
        const end = (i + 1) * sliceSize;
        const color = `hsl(${hue}, 70%, 55%)`;
        stops.push(`${color} ${start}deg`, `${color} ${end}deg`);
    }
    return `conic-gradient(${stops.join(", ")})`;
}

function initWheel() {
    document.getElementById("wheel").style.background = buildWheelGradient();
}

function spin() {
    const spinBtn = document.getElementById("spin-btn");
    spinBtn.disabled = true;

    const extraDegrees = Math.random() * 360;
    currentRotation += 4 * 360 + extraDegrees;

    const wheel = document.getElementById("wheel");
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const netRotation = currentRotation % 360;
        const rawHue = (360 - netRotation) % 360;
        const sliceSize = 360 / SLICE_COUNT;
        const sliceIndex = Math.floor(rawHue / sliceSize);
        currentHue = sliceIndex * sliceSize;
        spinBtn.disabled = false;
        renderResults();
    }, 4000);
}

function renderHarmonyButtons() {
    const container = document.getElementById("harmony-buttons");
    container.innerHTML = "";
    Object.entries(HARMONIES).forEach(([key, h]) => {
        const btn = document.createElement("button");
        btn.className = "mode-btn" + (harmonyMode === key ? " active" : "");
        btn.textContent = h.label;
        btn.onclick = () => {
            harmonyMode = key;
            renderHarmonyButtons();
            renderResults();
        };
        container.appendChild(btn);
    });
}

function renderResults() {
    const container = document.getElementById("result-swatches");
    container.innerHTML = "";

    const hues = HARMONIES[harmonyMode].getHues(currentHue);

    hues.forEach((h, i) => {
        let s, l;
        if (harmonyMode === "monochrome") {
            s = 70;
            l = [30, 55, 78][i];
        } else {
            s = 65;
            l = 55;
        }

        const hex = hslToHex(h, s, l);
        const textColor = contrastText(hex);

        const div = document.createElement("div");
        div.className = "result-swatch";
        div.style.backgroundColor = hex;

        const hexBtn = document.createElement("button");
        hexBtn.className = "hex-btn";
        hexBtn.style.color = textColor;
        hexBtn.textContent = hex.toUpperCase();
        hexBtn.onclick = () => {
            navigator.clipboard?.writeText(hex).catch(() => {});
            hexBtn.textContent = "Copied!";
            setTimeout(() => { hexBtn.textContent = hex.toUpperCase(); }, 1000);
        };

        div.appendChild(hexBtn);
        container.appendChild(div);
    });
}
document.getElementById("spin-btn").onclick = spin;

initWheel();
renderHarmonyButtons();
renderResults();