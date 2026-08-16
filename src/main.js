import * as d3 from 'd3';
import './style.css';

const COUNTRIES = ['Fiji', 'French Polynesia', 'Samoa', 'Tonga', 'Tuvalu', 'Vanuatu'];
const COLORS = {
  Fiji: '#e07a5f',
  'French Polynesia': '#3d7ea6',
  Samoa: '#5f9d75',
  Tonga: '#b88950',
  Tuvalu: '#3faaa1',
  Vanuatu: '#9a6fb0'
};
const sources = {
  population: 'https://stats.pacificdata.org/vis?fs[0]=Topic,0%7CPopulation%23POP%23&pg=0&fc=Topic&bp=true&snb=10&df[ds]=ds%3ASPC2&df[id]=DF_HHCOUNTS&df[ag]=SPC&df[vs]=1.0&dq=A..&lom=LASTNOBSERVATIONS&lo=1&pd=2016,2019&to[TIME_PERIOD]=false',
  power: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_POWER_GEN&df[ag]=SPC&df[vs]=1.0&av=true&dq=A...&pd=,&to[TIME_PERIOD]=false',
  oil: 'https://datahub.io/core/oil-prices'
};

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="masthead">
    <div class="eyebrow">Pacific energy atlas / 01—03</div>
    <h1>Powering the<br><em>Pacific</em></h1>
    <p class="dek">Six island nations. Vast distances. One urgent question: what makes a resilient energy future?</p>
    <div class="scroll-cue"><span></span>Scroll to explore</div>
  </header>
  <main>
    <section class="chapter geography" data-chapter="geography">
      <div class="chapter-heading"><span>01</span><h2>The unique geography</h2></div>
      <div class="scene intro-scene"><p>Ocean is the connective tissue here, but distance shapes every decision. <strong>Small populations live across large, separated worlds.</strong></p></div>
      <div class="sticky-story" data-story="geography">
        <div class="story-grid">
          <div class="visual-panel"><svg id="map" role="img" aria-label="Pacific island country map"></svg></div>
          <div class="story-copy">
            <article class="step is-active" data-step="0"><span class="step-number">01</span><h3>Separated by water</h3><p>The selected countries sit thousands of kilometres apart, scattered across the world's largest ocean.</p></article>
            <article class="step" data-step="1"><span class="step-number">02</span><h3>Small communities</h3><p>Population is concentrated in a handful of places. Every island is its own small energy system.</p></article>
            <article class="step" data-step="2"><span class="step-number">03</span><h3>Many islands, one nation</h3><p>Country borders conceal a more complicated reality: homes and grids spread across separate islands.</p></article>
          </div>
        </div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div><div class="story-trigger" data-step="1"></div><div class="story-trigger" data-step="2"></div></div>
      </div>
    </section>

    <section class="chapter oil-chapter" data-chapter="oil">
      <div class="chapter-heading"><span>02</span><h2>Power the islands</h2></div>
      <div class="scene intro-scene"><p>For now, the dependable answer is oil. It travels far, arrives ready to use, and keeps isolated grids moving.</p></div>
      <div class="sticky-story single-stage" data-story="oil-share">
        <div class="story-grid chart-stage">
          <div class="visual-panel"><svg id="oil-share" role="img" aria-label="Share of power generated from oil"></svg></div>
          <div class="story-copy"><article class="step is-active"><span class="step-number">01</span><h3>Why oil?</h3><ul class="reasons"><li>Stable enough for isolated grids</li><li>Elastic when demand changes</li><li>Portable across remote ports</li></ul></article></div>
        </div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div></div>
      </div>
      <div class="sticky-story single-stage" data-story="oil-price">
        <div class="story-grid oil-price-stage">
          <div class="visual-panel"><svg id="oil-price" role="img" aria-label="Brent crude oil price over time"></svg></div>
          <div class="story-copy"><article class="step is-active"><span class="step-number">02</span><h3>A costly connection</h3><p>Prices move sharply. Add the cost of shipping fuel to remote islands, and volatility becomes part of everyday infrastructure.</p></article></div>
        </div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div></div>
      </div>
    </section>

    <section class="chapter solar-chapter" data-chapter="solar">
      <div class="chapter-heading"><span>03</span><h2>Energy of the paradise</h2></div>
      <div class="scene intro-scene"><p>Solar is becoming more practical. With storage, sunshine can become a flexible part of a steadier, more independent mix.</p></div>
      <div class="sticky-story solar-story" data-story="solar">
        <div class="energy-stage">
          <div class="stage-header"><div><span class="kicker">Energy mix</span><h3 id="mix-title">Latest available year</h3></div><label for="year-range">Year <output id="year-value"></output></label></div>
          <svg id="energy-mix" role="img" aria-label="Energy mix by country"></svg>
          <input id="year-range" type="range" min="2000" max="2023" step="1" value="2000" />
          <div class="mix-key"><span><i class="solar"></i>Solar energy</span><span><i class="renewable"></i>Other renewable</span><span><i class="conventional"></i>Conventional sources</span></div>
        </div>
        <div class="closing-scene"><p><strong>The goal is not to replace oil overnight.</strong> It is to build a stable mix that can carry each country toward its next chapter.</p></div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div><div class="story-trigger" data-step="1"></div></div>
      </div>
    </section>

    <footer class="sources"><span class="kicker">Sources & notes</span><p>Population and power generation: <a href="${sources.population}" target="_blank" rel="noreferrer">Pacific Data Hub</a>. Oil prices: <a href="${sources.oil}" target="_blank" rel="noreferrer">Datahub.io / Brent daily</a>. Coordinates are supplied for visual context and are not used as a source.</p><p class="repo-note">Built as a scrollytelling report for GitHub Pages.</p></footer>
  </main>
`;

const parseCsv = (text) => d3.csvParse(text);
const numeric = (value) => Number.parseFloat(String(value).replace(/,/g, '')) || 0;
const targetRows = (rows, field = 'Pacific Island Countries and territories') => rows.filter((row) => COUNTRIES.includes(row[field]));

function drawMap(coordinates, population, step = 0) {
  const svg = d3.select('#map');
  const width = 920; const height = 580;
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  svg.selectAll('*').remove();
  const x = (longitude) => ((longitude + 180) / 360) * width;
  const y = (latitude) => ((latitude + 35) / 75) * height;
  svg.append('rect').attr('class', 'map-water').attr('width', width).attr('height', height);
  for (let longitude = -180; longitude <= 180; longitude += 30) svg.append('line').attr('class', 'grid-line').attr('x1', x(longitude)).attr('x2', x(longitude)).attr('y1', 0).attr('y2', height);
  const points = coordinates.filter((row) => COUNTRIES.includes(row.country_or_territory));
  const grouped = d3.group(points, (row) => row.country_or_territory);
  const marks = [];
  grouped.forEach((rows, country) => {
    const countryPoint = rows.find((row) => row.location_type === 'country' || row.location_type === 'territory') || rows[0];
    if (step < 2) marks.push({ country, row: countryPoint, radius: step === 1 ? Math.max(8, Math.sqrt(population[country] || 1) / 150) : 7 });
    else rows.filter((row, index, all) => all.findIndex((candidate) => candidate.normalized_name === row.normalized_name) === index).forEach((row) => marks.push({ country, row, radius: 5 }));
  });
  const groups = svg.append('g').selectAll('g').data(marks).join('g').attr('class', 'map-point').attr('transform', ({ row }) => `translate(${x(numeric(row.coordinates.split(',')[1]))},${y(numeric(row.coordinates.split(',')[0]))})`);
  groups.append('circle').attr('r', ({ radius }) => radius).attr('fill', ({ country }) => COLORS[country]);
  groups.append('text').attr('x', 10).attr('y', 4).text(({ country }) => country);
}

function drawOilShare(powerRows) {
  const svg = d3.select('#oil-share'); const width = 900; const height = 540;
  svg.attr('viewBox', `0 0 ${width} ${height}`); svg.selectAll('*').remove();
  const values = COUNTRIES.map((country) => {
    const rows = powerRows.filter((row) => row['Pacific Island Countries and territories'] === country);
    const latest = d3.max(rows, (row) => numeric(row.TIME_PERIOD));
    const yearRows = rows.filter((row) => numeric(row.TIME_PERIOD) === latest);
    const oil = d3.sum(yearRows.filter((row) => /oil/i.test(row['Energy source'])), (row) => numeric(row.OBS_VALUE));
    const total = d3.sum(yearRows.filter((row) => /total/i.test(row['Energy source']) || row.ENERGY_SOURCE === 'NRENTOT'), (row) => numeric(row.OBS_VALUE)) || d3.sum(yearRows, (row) => numeric(row.OBS_VALUE));
    return { country, value: total ? (oil / total) * 100 : 0 };
  });
  const x = d3.scaleBand(COUNTRIES, [100, width - 35]).padding(0.38); const y = d3.scaleLinear([0, 100], [height - 70, 55]);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - 70})`).call(d3.axisBottom(x).tickSize(0));
  svg.append('g').attr('class', 'axis').attr('transform', 'translate(100,0)').call(d3.axisLeft(y).ticks(5).tickFormat((value) => `${value}%`).tickSize(-width + 135));
  svg.append('g').selectAll('rect').data(values).join('rect').attr('x', (d) => x(d.country)).attr('y', (d) => y(d.value)).attr('width', x.bandwidth()).attr('height', (d) => y(0) - y(d.value)).attr('fill', (d) => COLORS[d.country]);
  svg.append('g').selectAll('text.value').data(values).join('text').attr('class', 'value-label').attr('x', (d) => x(d.country) + x.bandwidth() / 2).attr('y', (d) => y(d.value) - 12).text((d) => `${Math.round(d.value)}%`);
}

function drawOilPrice(oilRows) {
  const svg = d3.select('#oil-price'); const width = 900; const height = 540;
  svg.attr('viewBox', `0 0 ${width} ${height}`); svg.selectAll('*').remove();
  const rows = oilRows.map((row) => ({ date: new Date(row.Date), price: numeric(row.Price) })).filter((row) => row.date && row.price).filter((row) => row.date.getFullYear() >= 2010);
  const x = d3.scaleTime(d3.extent(rows, (d) => d.date), [100, width - 35]); const y = d3.scaleLinear(d3.extent(rows, (d) => d.price), [height - 70, 55]).nice();
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - 70})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%Y')));
  svg.append('g').attr('class', 'axis').attr('transform', 'translate(100,0)').call(d3.axisLeft(y).ticks(5).tickFormat((value) => `$${value}`).tickSize(-width + 135));
  svg.append('path').datum(rows).attr('class', 'price-line').attr('d', d3.line().x((d) => x(d.date)).y((d) => y(d.price)));
  const peak = rows.reduce((a, b) => a.price > b.price ? a : b);
  svg.append('circle').attr('class', 'peak-dot').attr('cx', x(peak.date)).attr('cy', y(peak.price)).attr('r', 5);
}

function drawEnergyMix(powerRows, year) {
  const svg = d3.select('#energy-mix'); const width = 1260; const height = 500; svg.attr('viewBox', `0 0 ${width} ${height}`); svg.selectAll('*').remove();
  const data = COUNTRIES.map((country) => {
    const rows = powerRows.filter((row) => row['Pacific Island Countries and territories'] === country && numeric(row.TIME_PERIOD) <= year);
    const latest = d3.max(rows, (row) => numeric(row.TIME_PERIOD)); const yearRows = rows.filter((row) => numeric(row.TIME_PERIOD) === latest);
    const solar = d3.sum(yearRows.filter((row) => /solar/i.test(row['Energy source'])), (row) => numeric(row.OBS_VALUE));
    const renewable = d3.sum(yearRows.filter((row) => /renew|hydro|wind|geothermal|bio/i.test(row['Energy source']) && !/total/i.test(row['Energy source'])), (row) => numeric(row.OBS_VALUE));
    const total = d3.sum(yearRows, (row) => numeric(row.OBS_VALUE));
    return { country, solar, renewable, conventional: Math.max(0, total - solar - renewable) };
  });
  const x = d3.scaleLinear([0, 100], [300, width - 55]); const y = d3.scaleBand(COUNTRIES, [55, height - 25]).padding(0.44);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - 25})`).call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d}%`).tickSize(-height + 95));
  svg.append('g').selectAll('text').data(data).join('text').attr('class', 'country-label').attr('x', 0).attr('y', (d) => y(d.country) + y.bandwidth() / 2 + 5).text((d) => d.country);
  data.forEach((d) => { const total = d.solar + d.renewable + d.conventional || 1; let start = 0; [['solar', d.solar], ['renewable', d.renewable], ['conventional', d.conventional]].forEach(([key, value]) => { const pct = (value / total) * 100; svg.append('rect').attr('class', `mix-bar ${key}`).attr('x', x(start)).attr('y', y(d.country)).attr('width', x(start + pct) - x(start)).attr('height', y.bandwidth()).attr('fill', key === 'solar' ? '#efc75e' : key === 'renewable' ? '#4d9b7b' : '#25516b'); start += pct; }); });
}

function activateStory(story, step, coordinates, populationTotals) {
  story.dataset.activeStep = step;
  story.querySelectorAll('.step').forEach((node, index) => node.classList.toggle('is-active', index === step));
  story.classList.remove('scene-refresh');
  requestAnimationFrame(() => story.classList.add('scene-refresh'));
  if (story.dataset.story === 'geography') drawMap(coordinates, populationTotals, step);
  if (story.dataset.story === 'solar') {
    story.querySelector('.energy-stage').classList.toggle('is-active', step === 0);
    story.querySelector('.closing-scene').classList.toggle('is-active', step === 1);
  }
}

function setupScrollStories(coordinates, populationTotals) {
  const stepObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const story = entry.target.closest('.sticky-story');
    activateStory(story, Number(entry.target.dataset.step), coordinates, populationTotals);
  }), { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
  document.querySelectorAll('.story-trigger').forEach((trigger) => stepObserver.observe(trigger));
  document.querySelectorAll('.sticky-story').forEach((story) => activateStory(story, 0, coordinates, populationTotals));
}

function setupPresentation(coordinates, populationTotals) {
  const masthead = document.querySelector('.masthead');
  const geography = document.querySelector('[data-chapter="geography"]');
  const oil = document.querySelector('[data-chapter="oil"]');
  const solar = document.querySelector('[data-chapter="solar"]');
  const sourcesFooter = document.querySelector('.sources');
  const geographyStory = geography.querySelector('[data-story="geography"]');
  const oilShareStory = oil.querySelector('[data-story="oil-share"]');
  const oilPriceStory = oil.querySelector('[data-story="oil-price"]');
  const solarStory = solar.querySelector('[data-story="solar"]');
  const scenes = [
    { root: masthead },
    { root: geography, element: geography.querySelector('.intro-scene') },
    { root: geography, story: geographyStory, step: 0 },
    { root: geography, story: geographyStory, step: 1 },
    { root: geography, story: geographyStory, step: 2 },
    { root: oil, element: oil.querySelector('.intro-scene') },
    { root: oil, story: oilShareStory, step: 0 },
    { root: oil, story: oilPriceStory, step: 0 },
    { root: solar, element: solar.querySelector('.intro-scene') },
    { root: solar, story: solarStory, step: 0 },
    { root: solar, story: solarStory, step: 1 },
    { root: sourcesFooter }
  ];
  let sceneIndex = 0;
  let isAnimating = false;
  const progress = document.createElement('div');
  progress.className = 'deck-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const render = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= scenes.length || nextIndex === sceneIndex || isAnimating) return;
    isAnimating = true;
    const scene = scenes[nextIndex];
    document.querySelectorAll('.presentation-active').forEach((node) => node.classList.remove('presentation-active'));
    document.querySelectorAll('.presentation-stage-active').forEach((node) => node.classList.remove('presentation-stage-active'));
    scene.root.classList.add('presentation-active');
    if (scene.element) scene.element.classList.add('presentation-stage-active');
    if (scene.story) {
      scene.story.classList.add('presentation-stage-active');
      activateStory(scene.story, scene.step, coordinates, populationTotals);
    }
    sceneIndex = nextIndex;
    progress.style.setProperty('--progress', `${((sceneIndex + 1) / scenes.length) * 100}%`);
    window.setTimeout(() => { isAnimating = false; }, 700);
  };

  document.body.classList.add('presentation-mode');
  masthead.classList.add('presentation-active');
  progress.style.setProperty('--progress', `${100 / scenes.length}%`);
  window.addEventListener('wheel', (event) => {
    event.preventDefault();
    if (Math.abs(event.deltaY) < 8) return;
    render(sceneIndex + (event.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    const forwardKeys = ['ArrowDown', 'PageDown', ' '];
    const backwardKeys = ['ArrowUp', 'PageUp'];
    if (!forwardKeys.includes(event.key) && !backwardKeys.includes(event.key)) return;
    event.preventDefault();
    render(sceneIndex + (forwardKeys.includes(event.key) ? 1 : -1));
  });
}

async function init() {
  const [population, power, coordinates, oil] = await Promise.all(['population.csv', 'power_generation.csv', 'pacific_island_coordinates.csv', 'brent-daily.csv'].map((file) => fetch(`./data/${file}`).then((response) => response.text()).then(parseCsv)));
  const populationTotals = Object.fromEntries(COUNTRIES.map((country) => [country, d3.max(targetRows(population).filter((row) => row['Pacific Island Countries and territories'] === country), (row) => numeric(row.OBS_VALUE)) || 1]));
  const years = power.map((row) => numeric(row.TIME_PERIOD)).filter(Boolean); const earliest = d3.min(years) || 2000; const latest = d3.max(years) || earliest;
  const range = document.querySelector('#year-range'); range.min = earliest; range.max = latest; range.value = earliest; document.querySelector('#year-value').textContent = earliest;
  drawMap(coordinates, populationTotals); drawOilShare(power); drawOilPrice(oil); drawEnergyMix(power, earliest);
  range.addEventListener('input', (event) => { document.querySelector('#year-value').textContent = event.target.value; drawEnergyMix(power, Number(event.target.value)); });
  setupPresentation(coordinates, populationTotals);
}
init().catch((error) => { app.innerHTML += `<p class="error">Could not load the supplied data. ${error.message}</p>`; });
