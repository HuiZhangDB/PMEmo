/* PMEmo · Brutalist terminal visualization */
const DATA_BASE = "data";
const SAMPLE_BASE = `${DATA_BASE}/samples`;

/* -------------------- palette -------------------- */
const P = {
  paper:  "#fafaf7",
  paper2: "#f1f1ec",
  ink:    "#0a0a0a",
  ink2:   "#4a4a4a",
  ink3:   "#8a8a86",
  rule:   "#d8d8d4",
  signal: "#ee2200",
  blue:   "#0033ee",
  green:  "#117733",
  amber:  "#ee7700",
};

const QUAD_COLORS = {
  "Q1 高V 高A (欢快)": P.signal,
  "Q2 低V 高A (紧张)": P.amber,
  "Q3 低V 低A (悲伤)": P.blue,
  "Q4 高V 低A (平静)": P.green,
};

const QUAD_LABEL = {
  "Q1 高V 高A (欢快)": "Q1 / JOY",
  "Q2 低V 高A (紧张)": "Q2 / TENSE",
  "Q3 低V 低A (悲伤)": "Q3 / SAD",
  "Q4 高V 低A (平静)": "Q4 / CALM",
};

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

/* shared echarts axis style */
const AXIS = {
  axisLine:  { lineStyle: { color: P.ink, width: 1 } },
  axisTick:  { lineStyle: { color: P.ink }, length: 4 },
  axisLabel: { color: P.ink2, fontFamily: MONO, fontSize: 10.5 },
  splitLine: { lineStyle: { color: P.rule, type: "dashed" } },
};
const AXIS_NAME = (text) => ({
  name: text,
  nameTextStyle: { color: P.ink3, fontFamily: MONO, fontSize: 10, padding: [8, 0, 0, 0] },
  nameLocation: "middle",
  nameGap: 30,
});

function tip() {
  return {
    backgroundColor: P.ink,
    borderColor: P.signal,
    borderWidth: 1,
    textStyle: { color: P.paper, fontFamily: MONO, fontSize: 11.5 },
    extraCssText: "border-radius:0; padding:8px 10px; box-shadow:none;",
  };
}

const charts = [];
function makeChart(el) {
  const c = echarts.init(el, null, { renderer: "canvas" });
  charts.push(c);
  return c;
}
window.addEventListener("resize", () => charts.forEach((c) => c.resize()));

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`fetch ${path} failed`);
  return res.json();
}

/* -------------------- almanac -------------------- */
function renderAlmanac(o) {
  const stats = [
    { label: "n_songs", num: o.n_songs },
    { label: "n_static_anno", num: o.n_static_anno },
    { label: "n_subjects", num: o.n_subjects },
    { label: "n_eda_files", num: o.n_eda_files },
    { label: "audio_total", num: o.total_audio_hours, suffix: "h" },
    { label: "n_dynamic_rows", num: (o.n_dynamic_rows / 1000).toFixed(1), suffix: "k" },
    { label: "n_lyrics", num: o.n_lyrics },
    { label: "n_comment_files", num: o.n_netease_comments_files + o.n_soundcloud_comments_files },
  ];
  document.getElementById("almanac").innerHTML = stats
    .map((s) => `
      <div class="almanac-cell">
        <div class="label">${s.label}</div>
        <div class="num">${s.num}${s.suffix ? `<small>${s.suffix}</small>` : ""}</div>
      </div>`)
    .join("");
}

/* -------------------- bar / pie -------------------- */
function renderSource() {
  const c = makeChart(document.getElementById("chart-source"));
  c.setOption({
    grid: { left: 130, right: 60, top: 14, bottom: 26 },
    tooltip: { ...tip(), trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(238,34,0,0.06)" } } },
    xAxis: { type: "value", ...AXIS, splitLine: { show: false } },
    yAxis: {
      type: "category",
      data: ["UK Top 40", "Billboard Hot 100", "iTunes Top 100"],
      axisLine: { lineStyle: { color: P.ink } },
      axisTick: { show: false },
      axisLabel: { color: P.ink, fontFamily: MONO, fontSize: 11.5, fontWeight: 500 },
    },
    series: [
      {
        type: "bar",
        data: [226, 487, 616],
        barWidth: 16,
        itemStyle: { color: P.signal, borderRadius: 0 },
        label: {
          show: true, position: "right",
          color: P.ink, fontFamily: MONO, fontSize: 12, fontWeight: 700,
        },
      },
    ],
  });
}

function renderQuadrant(o) {
  const c = makeChart(document.getElementById("chart-quadrant"));
  const labels = Object.keys(o.quadrant_counts);
  const data = labels.map((l) => ({
    name: QUAD_LABEL[l] || l,
    value: o.quadrant_counts[l],
    itemStyle: { color: QUAD_COLORS[l], borderColor: P.paper, borderWidth: 1 },
  }));
  c.setOption({
    tooltip: { ...tip(), trigger: "item", formatter: "{b}<br/>n={c} ({d}%)" },
    series: [
      {
        type: "pie",
        radius: ["0%", "78%"],
        startAngle: 90,
        avoidLabelOverlap: true,
        label: {
          color: P.ink, fontFamily: MONO, fontSize: 11, fontWeight: 700,
          formatter: "{b}\n{c}",
          lineHeight: 14,
        },
        labelLine: { lineStyle: { color: P.ink2 }, length: 8, length2: 6 },
        data,
      },
    ],
  });
}

function renderArtists(o) {
  const c = makeChart(document.getElementById("chart-artist"));
  const arr = o.top_artists.slice().reverse();
  c.setOption({
    grid: { left: 160, right: 50, top: 10, bottom: 26 },
    tooltip: { ...tip(), trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(238,34,0,0.06)" } } },
    xAxis: { type: "value", ...AXIS, splitLine: { show: false } },
    yAxis: {
      type: "category",
      data: arr.map((a) => a.artist),
      axisLine: { lineStyle: { color: P.ink } },
      axisTick: { show: false },
      axisLabel: { color: P.ink, fontFamily: MONO, fontSize: 11.5, fontWeight: 500 },
    },
    series: [
      {
        type: "bar",
        data: arr.map((a) => a.count),
        barWidth: 11,
        itemStyle: { color: P.ink, borderRadius: 0 },
        label: {
          show: true, position: "right",
          color: P.signal, fontFamily: MONO, fontSize: 12, fontWeight: 700,
        },
      },
    ],
  });
}

/* -------------------- VA scatter -------------------- */
let vaChart;
function renderScatter(scatter, overview) {
  const el = document.getElementById("chart-va");
  vaChart = makeChart(el);
  const data = scatter.map((p) => [p.v, p.a, p.id, p.title, p.artist]);
  const heatData = overview.heatmap;
  const maxCount = Math.max(...heatData.map((d) => d[2]));
  vaChart.setOption({
    grid: { left: 56, right: 28, top: 36, bottom: 50 },
    tooltip: {
      ...tip(),
      trigger: "item",
      formatter: (p) => {
        if (p.seriesType === "heatmap") return null;
        const d = p.data;
        return `<b style="color:${P.signal}">${d[3]}</b><br/>${d[4]}<br/>V=${d[0].toFixed(2)} A=${d[1].toFixed(2)}`;
      },
    },
    xAxis: {
      type: "value", min: 0, max: 1,
      ...AXIS, ...AXIS_NAME("VALENCE →"),
    },
    yAxis: {
      type: "value", min: 0, max: 1,
      ...AXIS, ...AXIS_NAME("AROUSAL →"),
      nameRotate: 90, nameLocation: "middle", nameGap: 38,
    },
    visualMap: {
      show: false, seriesIndex: 0,
      pieces: [
        { lt: Math.ceil(maxCount * 0.7),                                  color: "rgba(238,34,0,0)" },
        { gte: Math.ceil(maxCount * 0.7), lt: Math.ceil(maxCount * 0.9),  color: "rgba(238,34,0,0.06)" },
        { gte: Math.ceil(maxCount * 0.9),                                  color: "rgba(238,34,0,0.13)" },
      ],
      outOfRange: { color: "rgba(238,34,0,0)" },
    },
    series: [
      { type: "heatmap", data: heatData, coordinateSystem: "cartesian2d", progressive: 1000 },
      {
        type: "scatter",
        data,
        symbol: "rect",
        symbolSize: 5,
        itemStyle: {
          color: (p) => {
            const v = p.data[0], a = p.data[1];
            if (v >= 0.5 && a >= 0.5) return P.signal;
            if (v < 0.5 && a >= 0.5) return P.amber;
            if (v < 0.5 && a < 0.5) return P.blue;
            return P.green;
          },
          opacity: 0.9,
        },
        emphasis: { focus: "series", scale: 2.5, itemStyle: { borderColor: P.ink, borderWidth: 1 } },
      },
      {
        type: "line",
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: P.ink, type: "solid", width: 1 },
          label: { show: false },
          data: [{ xAxis: 0.5 }, { yAxis: 0.5 }],
        },
      },
      {
        type: "scatter",
        symbolSize: 0,
        silent: true,
        data: [
          { value: [0.95, 0.95], label: { show: true, formatter: "[Q1]", color: P.signal, fontFamily: MONO, fontSize: 11, fontWeight: 700, align: "right" } },
          { value: [0.05, 0.95], label: { show: true, formatter: "[Q2]", color: P.amber, fontFamily: MONO, fontSize: 11, fontWeight: 700, align: "left" } },
          { value: [0.05, 0.05], label: { show: true, formatter: "[Q3]", color: P.blue, fontFamily: MONO, fontSize: 11, fontWeight: 700, align: "left" } },
          { value: [0.95, 0.05], label: { show: true, formatter: "[Q4]", color: P.green, fontFamily: MONO, fontSize: 11, fontWeight: 700, align: "right" } },
        ],
      },
    ],
  });
  vaChart.on("click", (p) => {
    if (p.seriesType !== "scatter" || !p.data || p.data.length < 5) return;
    const [v, a, id, title, artist] = p.data;
    showVaDetail({ id, v, a, title, artist });
  });
}

function showVaDetail(p) {
  const el = document.getElementById("va-side-body");
  let q = "Q4 高V 低A (平静)";
  if (p.v >= 0.5 && p.a >= 0.5) q = "Q1 高V 高A (欢快)";
  else if (p.v < 0.5 && p.a >= 0.5) q = "Q2 低V 高A (紧张)";
  else if (p.v < 0.5 && p.a < 0.5) q = "Q3 低V 低A (悲伤)";
  const color = QUAD_COLORS[q];
  document.getElementById("va-side-title").textContent = p.title;
  el.innerHTML = `
    <div class="va-quad" style="color:${color}; border-color:${color}">${QUAD_LABEL[q]}</div>
    <div class="va-stats">
      <div>artist <b>${escapeHTML(p.artist)}</b></div>
      <div>music_id <b>#${p.id}</b></div>
      <div>valence <b style="color:${P.signal}">${p.v.toFixed(3)}</b></div>
      <div>arousal <b style="color:${P.signal}">${p.a.toFixed(3)}</b></div>
    </div>
    <p class="muted">≥10 名标注者评分均值 — 在愉悦度 ${(p.v * 100).toFixed(0)}% × 唤醒度 ${(p.a * 100).toFixed(0)}% 的位置。</p>
  `;
}

/* -------------------- tracklist -------------------- */
let SAMPLE_INDEX = [];
let activeSampleId = null;
let dynChart, edaChart;

function renderSampleTabs(samples) {
  const el = document.getElementById("sample-tabs");
  el.innerHTML = samples
    .map((s, i) => `
      <div class="track" data-id="${s.id}">
        <div class="t-num">${String(i + 1).padStart(2, "0")} · ${QUAD_LABEL[s.quadrant]}</div>
        <div class="t-title">${escapeHTML(s.title)}</div>
        <div class="t-artist">${escapeHTML(s.artist)}</div>
        <div class="t-v">v <b>${s.v.toFixed(2)}</b></div>
        <div class="t-a">a <b>${s.a.toFixed(2)}</b></div>
        <div class="t-arrow">►</div>
      </div>`)
    .join("");
  el.querySelectorAll(".track").forEach((tab) => {
    tab.addEventListener("click", () => loadSample(parseInt(tab.dataset.id, 10)));
  });
}

async function loadSample(id) {
  if (activeSampleId === id) return;
  activeSampleId = id;
  document.querySelectorAll(".track").forEach((t) => {
    t.classList.toggle("active", parseInt(t.dataset.id, 10) === id);
  });
  const detail = await fetchJSON(`${SAMPLE_BASE}/${id}.json`);
  renderSampleDetail(detail);
}

function renderSampleDetail(s) {
  const el = document.getElementById("sample-detail");
  const color = QUAD_COLORS[s.quadrant];
  el.innerHTML = `
    <div class="detail-head">
      <div>
        <h3 class="detail-title">${escapeHTML(s.title)}</h3>
        <p class="detail-sub">${escapeHTML(s.artist)} — ${escapeHTML(s.album)}</p>
      </div>
      <div class="detail-meta">
        <span><span class="dot" style="background:${color}"></span>${QUAD_LABEL[s.quadrant]}</span>
        <span>id #${s.id} · chorus ${s.chorus[0]}–${s.chorus[1]}</span>
        <span>v ${s.valence_mean} · a ${s.arousal_mean}</span>
      </div>
    </div>
    <div class="audio-row">
      <div class="audio-tag">PLAY<br/>CHORUS</div>
      <audio id="sample-audio" controls preload="metadata" src="${SAMPLE_BASE}/${s.id}.mp3"></audio>
    </div>
    <div class="detail-charts">
      <div>
        <div class="sub-head"><b>FIG.A</b> dynamic_va · 2 Hz · first 15 s discarded</div>
        <div id="chart-dyn" class="chart"></div>
      </div>
      <div>
        <div class="sub-head"><b>FIG.B</b> eda · 4 subjects + group mean · z-score</div>
        <div id="chart-eda" class="chart"></div>
      </div>
    </div>
    <div class="detail-text">
      <div class="text-block">
        <span class="lbl">lyrics · 歌词节选</span>
        <div class="text-body">
          ${(s.lyrics || "(无)").split("\n").slice(0, 18).map((l) => `<p>${escapeHTML(l)}</p>`).join("")}
        </div>
      </div>
      <div class="text-block">
        <span class="lbl">netease · 网易云评论</span>
        <div class="text-body">
          ${(s.netease.length ? s.netease : ["(无)"]).slice(0, 18).map((l) => `<p>${escapeHTML(l)}</p>`).join("")}
        </div>
      </div>
      <div class="text-block">
        <span class="lbl">soundcloud · listener voices</span>
        <div class="text-body">
          ${(s.soundcloud.length ? s.soundcloud : ["(无)"]).slice(0, 18).map((l) => `<p>${escapeHTML(l)}</p>`).join("")}
        </div>
      </div>
    </div>
  `;
  buildDynChart(s);
  buildEdaChart(s);
  bindAudioSync(s);
}

function buildDynChart(s) {
  const el = document.getElementById("chart-dyn");
  dynChart = makeChart(el);
  dynChart.setOption({
    legend: {
      textStyle: { color: P.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 },
      top: 0, right: 0, icon: "rect", itemWidth: 12, itemHeight: 3,
    },
    tooltip: { ...tip(), trigger: "axis" },
    grid: { left: 38, right: 22, top: 26, bottom: 30 },
    xAxis: { type: "value", ...AXIS, ...AXIS_NAME("t/s"), nameGap: 22 },
    yAxis: { type: "value", min: 0, max: 1, ...AXIS },
    series: [
      {
        name: "valence",
        type: "line", showSymbol: false, smooth: false,
        lineStyle: { color: P.signal, width: 1.5 },
        data: s.dynamic.t.map((t, i) => [t, s.dynamic.v[i]]),
        markLine: {
          symbol: "none",
          lineStyle: { color: P.ink, type: "solid", width: 1 },
          label: { show: false }, data: [], silent: true,
        },
      },
      {
        name: "arousal",
        type: "line", showSymbol: false, smooth: false,
        lineStyle: { color: P.blue, width: 1.5 },
        data: s.dynamic.t.map((t, i) => [t, s.dynamic.a[i]]),
      },
    ],
  });
}

function buildEdaChart(s) {
  const el = document.getElementById("chart-eda");
  edaChart = makeChart(el);
  const subjColors = [P.ink3, P.ink3, P.ink3, P.ink3];
  const series = [
    {
      name: "mean",
      type: "line", showSymbol: false, smooth: false,
      lineStyle: { color: P.signal, width: 1.8 },
      data: s.eda.t.map((t, i) => [t, s.eda.mean[i]]),
      z: 5,
      markLine: {
        symbol: "none",
        lineStyle: { color: P.ink, type: "solid", width: 1 },
        label: { show: false }, data: [], silent: true,
      },
    },
    ...s.eda.subjects.map((sub, i) => ({
      name: `s${i + 1}`,
      type: "line", showSymbol: false, smooth: false,
      lineStyle: { color: subjColors[i % 4], width: 0.8, opacity: 0.55 },
      data: s.eda.t.map((t, j) => [t, sub.values[j]]),
    })),
  ];
  edaChart.setOption({
    legend: {
      textStyle: { color: P.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 },
      top: 0, right: 0, icon: "rect", itemWidth: 12, itemHeight: 3,
    },
    tooltip: { ...tip(), trigger: "axis" },
    grid: { left: 38, right: 22, top: 26, bottom: 30 },
    xAxis: { type: "value", ...AXIS, ...AXIS_NAME("t/s"), nameGap: 22 },
    yAxis: { type: "value", ...AXIS, ...AXIS_NAME("z"), nameGap: 28, nameRotate: 90, nameLocation: "middle" },
    series,
  });
}

function bindAudioSync(s) {
  const audio = document.getElementById("sample-audio");
  if (!audio) return;
  const dynStart = s.dynamic.t[0];
  let raf = null;
  const update = () => {
    raf = null;
    const t = audio.currentTime + dynStart;
    if (dynChart) dynChart.setOption({ series: [{ markLine: { data: [{ xAxis: t }] } }, {}] });
    if (edaChart) edaChart.setOption({ series: [{ markLine: { data: [{ xAxis: t }] } }] });
  };
  audio.addEventListener("timeupdate", () => {
    if (!raf) raf = requestAnimationFrame(update);
  });
}

/* -------------------- word clouds -------------------- */
function renderCloud(elId, words, palette) {
  const c = makeChart(document.getElementById(elId));
  c.setOption({
    backgroundColor: "transparent",
    series: [
      {
        type: "wordCloud",
        shape: "square",
        sizeRange: [11, 48],
        rotationRange: [0, 0],
        rotationStep: 0,
        gridSize: 4,
        textStyle: {
          color: () => palette[Math.floor(Math.random() * palette.length)],
          fontFamily: MONO,
          fontWeight: 700,
        },
        emphasis: { textStyle: { color: P.signal } },
        data: words,
      },
    ],
  });
}

function renderTextSection(lyr, ne, sc) {
  document.getElementById("lyrics-meta").textContent =
    `n_files=${lyr.n_files} · vocab=${lyr.vocab_size} · tokens=${(lyr.total_tokens / 1000).toFixed(1)}k`;
  document.getElementById("ne-meta").textContent =
    `n_files=${ne.n_files} · lines=${ne.total_lines} · vocab=${ne.vocab_size}`;
  document.getElementById("sc-meta").textContent =
    `n_files=${sc.n_files} · lines=${sc.total_lines} · vocab=${sc.vocab_size}`;
  renderCloud("cloud-lyrics", lyr.top_words, [P.ink, P.ink, P.signal, P.blue]);
  renderCloud("cloud-sc", sc.top_words, [P.ink, P.ink, P.signal, P.green]);
  renderCloud("cloud-ne", ne.top_words, [P.ink, P.ink, P.signal, P.amber]);

  const c = makeChart(document.getElementById("bar-text"));
  const top = 14;
  c.setOption({
    legend: {
      textStyle: { color: P.ink, fontFamily: MONO, fontSize: 11, fontWeight: 700 },
      top: 0, right: 0, icon: "rect", itemWidth: 12, itemHeight: 3,
    },
    grid: { top: 30, left: 100, right: 30, bottom: 26 },
    tooltip: { ...tip(), trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(238,34,0,0.06)" } } },
    xAxis: { type: "value", ...AXIS, splitLine: { show: false } },
    yAxis: {
      type: "category",
      data: Array.from({ length: top }, (_, i) => `#${String(i + 1).padStart(2, "0")}`),
      axisLine: { lineStyle: { color: P.ink } },
      axisTick: { show: false },
      axisLabel: { color: P.ink3, fontFamily: MONO, fontSize: 10.5 },
    },
    series: [
      {
        name: "netease (zh)",
        type: "bar", barGap: 0,
        data: ne.top_words.slice(0, top).reverse().map((w) => ({ value: w.value, name: w.name })),
        itemStyle: { color: P.signal, borderRadius: 0 },
        label: { show: true, position: "right", formatter: (p) => p.data.name, color: P.signal, fontFamily: MONO, fontSize: 11.5, fontWeight: 700 },
      },
      {
        name: "soundcloud (en)",
        type: "bar",
        data: sc.top_words.slice(0, top).reverse().map((w) => ({ value: w.value, name: w.name })),
        itemStyle: { color: P.ink, borderRadius: 0 },
        label: { show: true, position: "right", formatter: (p) => p.data.name, color: P.ink, fontFamily: MONO, fontSize: 11.5, fontWeight: 700 },
      },
    ],
  });
}

/* -------------------- ML demo -------------------- */
function renderML(ml) {
  document.getElementById("ml-v-meta").textContent =
    `n=${ml.n_test} · rmse=${ml.metrics.valence.rmse} · r=${ml.metrics.valence.r} (paper r=0.638)`;
  document.getElementById("ml-a-meta").textContent =
    `n=${ml.n_test} · rmse=${ml.metrics.arousal.rmse} · r=${ml.metrics.arousal.r} (paper r=0.764)`;

  const mkPredChart = (elId, key, color) => {
    const c = makeChart(document.getElementById(elId));
    const data = ml.test_predictions.map((p) => [p[`${key}_true`], p[`${key}_pred`]]);
    c.setOption({
      tooltip: {
        ...tip(), trigger: "item",
        formatter: (p) => `truth=${p.data[0].toFixed(2)}<br/>pred=${p.data[1].toFixed(2)}<br/>resid=${(p.data[1] - p.data[0]).toFixed(2)}`,
      },
      grid: { left: 50, right: 28, top: 24, bottom: 50 },
      xAxis: { type: "value", min: 0, max: 1, ...AXIS, ...AXIS_NAME("ground_truth →"), nameGap: 30 },
      yAxis: { type: "value", min: 0, max: 1, ...AXIS, ...AXIS_NAME("prediction →"), nameRotate: 90, nameLocation: "middle", nameGap: 38 },
      series: [
        {
          type: "scatter",
          data,
          symbol: "rect",
          symbolSize: 6,
          itemStyle: { color, opacity: 0.85 },
          markLine: {
            silent: true, symbol: "none",
            lineStyle: { type: "dashed", color: P.ink2, width: 1 },
            label: { show: false },
            data: [[{ coord: [0, 0] }, { coord: [1, 1] }]],
          },
        },
      ],
    });
  };
  mkPredChart("chart-pred-v", "v", P.signal);
  mkPredChart("chart-pred-a", "a", P.blue);
}

/* -------------------- quiz -------------------- */
let quizSampleId = null;
let quizGuess = null;
let quizChart = null;

function renderQuiz(samples) {
  const el = document.getElementById("quiz");
  el.innerHTML = `
    <div class="quiz-controls">
      <div class="step">[step 1] pick a track</div>
      <div class="quiz-pick" id="quiz-pick">
        ${samples.map((s, i) => `
          <button data-id="${s.id}">
            <span class="pick-num">${String(i + 1).padStart(2, "0")}</span>
            <span>${escapeHTML(s.title)} · <span style="color:var(--ink-3)">${escapeHTML(s.artist)}</span></span>
            <span class="pick-quad">${QUAD_LABEL[s.quadrant]}</span>
          </button>`).join("")}
      </div>
      <div class="step">[step 2] listen</div>
      <audio id="quiz-audio" controls preload="metadata"></audio>
      <div class="step">[step 3] click your guess on the right →</div>
      <div class="quiz-result" id="quiz-result">awaiting input.</div>
    </div>
    <div class="quiz-plot-wrap">
      <div id="quiz-plot"></div>
    </div>
  `;
  el.querySelectorAll("#quiz-pick button").forEach((b) => {
    b.addEventListener("click", () => {
      quizSampleId = parseInt(b.dataset.id, 10);
      el.querySelectorAll("#quiz-pick button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const audio = document.getElementById("quiz-audio");
      audio.src = `${SAMPLE_BASE}/${quizSampleId}.mp3`;
      quizGuess = null;
      drawQuizPlot();
      document.getElementById("quiz-result").textContent = "click on the V-A plane to make your guess.";
    });
  });
  drawQuizPlot();
}

function drawQuizPlot() {
  const el = document.getElementById("quiz-plot");
  if (!quizChart) quizChart = makeChart(el);
  const truth = SAMPLE_INDEX.find((s) => s.id === quizSampleId);
  const truthData = truth ? [[truth.v, truth.a]] : [];
  const guessData = quizGuess ? [quizGuess] : [];
  quizChart.setOption({
    grid: { left: 50, right: 28, top: 26, bottom: 50 },
    tooltip: {
      ...tip(), trigger: "item",
      formatter: (p) => {
        if (p.seriesName === "annotators") return `<b>annotators</b><br/>V=${p.data[0].toFixed(2)} A=${p.data[1].toFixed(2)}`;
        if (p.seriesName === "your_guess") return `<b>your guess</b><br/>V=${p.data[0].toFixed(2)} A=${p.data[1].toFixed(2)}`;
        return null;
      },
    },
    xAxis: { type: "value", min: 0, max: 1, ...AXIS, ...AXIS_NAME("VALENCE →"), nameGap: 30 },
    yAxis: { type: "value", min: 0, max: 1, ...AXIS, ...AXIS_NAME("AROUSAL →"), nameRotate: 90, nameLocation: "middle", nameGap: 38 },
    series: [
      {
        name: "annotators",
        type: "scatter",
        data: truthData,
        symbol: "rect",
        symbolSize: 22,
        itemStyle: { color: P.signal },
        label: { show: true, formatter: "★", color: P.paper, fontSize: 14, fontWeight: 700 },
      },
      {
        name: "your_guess",
        type: "scatter",
        data: guessData,
        symbol: "rect",
        symbolSize: 18,
        itemStyle: { color: P.ink },
        label: { show: true, formatter: "✕", color: P.signal, fontSize: 14, fontWeight: 700 },
      },
      {
        type: "line",
        markLine: {
          silent: true, symbol: "none",
          lineStyle: { color: P.ink, type: "solid", width: 1 },
          label: { show: false },
          data: [{ xAxis: 0.5 }, { yAxis: 0.5 }],
        },
      },
    ],
  });
  quizChart.getZr().off("click");
  quizChart.getZr().on("click", (params) => {
    if (!quizSampleId) {
      document.getElementById("quiz-result").textContent = "select a track first.";
      return;
    }
    const point = quizChart.convertFromPixel({ gridIndex: 0 }, [params.offsetX, params.offsetY]);
    if (!point) return;
    const v = Math.max(0, Math.min(1, point[0]));
    const a = Math.max(0, Math.min(1, point[1]));
    quizGuess = [v, a];
    drawQuizPlot();
    if (truth) {
      const dv = v - truth.v, da = a - truth.a;
      const dist = Math.sqrt(dv * dv + da * da);
      const verdict =
        dist < 0.1 ? "STATUS: tight match — within 0.10."
          : dist < 0.2 ? "STATUS: same quadrant, close enough."
            : dist < 0.35 ? "STATUS: divergent — different read on the emotion."
              : "STATUS: far off — listener disagreement is real.";
      document.getElementById("quiz-result").innerHTML = `
        guess  → V=<b>${v.toFixed(2)}</b> A=<b>${a.toFixed(2)}</b><br/>
        truth  → V=<b>${truth.v.toFixed(2)}</b> A=<b>${truth.a.toFixed(2)}</b><br/>
        |Δ|    = <b>${dist.toFixed(3)}</b><br/>${verdict}
      `;
    }
  });
}

/* -------------------- util -------------------- */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[m]));
}

/* -------------------- boot -------------------- */
async function boot() {
  try {
    const [overview, scatter, samples, lyr, ne, sc, ml] = await Promise.all([
      fetchJSON(`${DATA_BASE}/overview.json`),
      fetchJSON(`${DATA_BASE}/scatter.json`),
      fetchJSON(`${SAMPLE_BASE}/index.json`),
      fetchJSON(`${DATA_BASE}/lyrics_analysis.json`),
      fetchJSON(`${DATA_BASE}/comments_netease.json`),
      fetchJSON(`${DATA_BASE}/comments_soundcloud.json`),
      fetchJSON(`${DATA_BASE}/ml_demo.json`),
    ]);
    SAMPLE_INDEX = samples;
    renderAlmanac(overview);
    renderSource();
    renderQuadrant(overview);
    renderArtists(overview);
    renderScatter(scatter, overview);
    renderSampleTabs(samples);
    if (samples.length) await loadSample(samples[0].id);
    renderTextSection(lyr, ne, sc);
    renderML(ml);
    renderQuiz(samples);
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div style="padding:18px;background:#0a0a0a;color:#ee2200;font-family:monospace;font-size:12px;border-bottom:2px solid #ee2200">ERROR // 数据加载失败 // ${err.message} // 请确认 site/data/ 下的 JSON 文件已生成（运行 scripts/prepare_data.py）。</div>`,
    );
  }
}
boot();
