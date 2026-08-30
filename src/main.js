import * as d3 from 'd3';
import './style.css';

const COUNTRIES = ['Fiji', 'French Polynesia', 'Samoa', 'Tonga', 'Tuvalu', 'Vanuatu'];
const COLORS = {
  Fiji: '#1f5fa8',
  'French Polynesia': '#a97c50',
  Samoa: '#2f8f5b',
  Tonga: '#c9a227',
  Tuvalu: '#3fb6c9',
  Vanuatu: '#8aab4f'
};
const sources = {
  population: 'https://stats.pacificdata.org/vis?fs[0]=Topic,0%7CPopulation%23POP%23&pg=0&fc=Topic&bp=true&snb=10&df[ds]=ds%3ASPC2&df[id]=DF_HHCOUNTS&df[ag]=SPC&df[vs]=1.0&dq=A..&lom=LASTNOBSERVATIONS&lo=1&pd=2016,2019&to[TIME_PERIOD]=false',
  power: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_POWER_GEN&df[ag]=SPC&df[vs]=1.0&av=true&dq=A...&pd=,&to[TIME_PERIOD]=false',
  oil: 'https://datahub.io/core/oil-prices'
};

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="masthead">
    <h1>Powering the<br><em>Pacific</em></h1>
    <p class="dek">Six island nations. Vast distances. One urgent question: what makes a resilient energy future?</p>
    <div class="scroll-cue"><span></span>Scroll to explore</div>
  </header>
  <main>
    <section class="chapter geography" data-chapter="geography">
      <div class="chapter-heading"><span>01</span><h2>The unique geography</h2></div>
      <div class="scene intro-scene"><p>The Pacific is a region where geography shapes almost everything. Distance, scale, and isolation influence how countries function, how communities connect, and how infrastructure can be built and maintained. To understand the challenges these nations face, we first need to understand the space they occupy. <strong>Small populations live across large, separated worlds.</strong></p></div>
      <div class="sticky-story" data-story="geography">
        <div class="story-grid">
          <div class="visual-panel"><svg id="map" role="img" aria-label="Pacific island country map"></svg></div>
          <div class="story-copy">
            <article class="step is-active" data-step="0"><h3>Separated by water</h3><p>Pacific nations face challenges unlike those of almost any other region on the planet. Scattered across remote parts of the ocean, they must rely on their own resilience, resourcefulness, and adaptability.</p></article>
            <article class="step" data-step="1"><h3>Small nations, great diversity</h3><p>Isolation does not make the Pacific uniform. These nations differ enormously in population, from tiny communities of only a few thousand people to countries with populations in the hundreds of thousands. Population density, urbanisation, and settlement patterns vary just as widely.</p></article>
            <article class="step" data-step="2"><h3>Fragmented by the Ocean</h3><p>Many Pacific nations are not built around a single island. Their territory is divided among dozens, or even hundreds of islands, often separated by long stretches of open water. National borders may connect them politically, but geography keeps their communities physically apart.</p></article>
          </div>
        </div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div><div class="story-trigger" data-step="1"></div><div class="story-trigger" data-step="2"></div></div>
      </div>
    </section>

    <section class="chapter oil-chapter" data-chapter="oil">
      <div class="chapter-heading"><span>02</span><h2>Power the islands</h2></div>
      <div class="scene intro-scene"><p>Producing electricity in remote island communities is a challenge in itself. Energy is the foundation of almost everything, from homes and hospitals to schools, businesses, communications, and transport infrastructure. For these communities to function, power has to be available wherever people live.<br><br>Today, much of that electricity is still generated from oil-based fuels, especially diesel. The reason is simple: it is reliable, flexible, and easy to scale. A power system can range from a small generator serving a handful of buildings to a larger power station supplying an entire neighbourhood or island.</p></div>
      <div class="sticky-story single-stage" data-story="oil-share">
        <div class="story-grid chart-stage">
          <div class="visual-panel"><div class="chart-title"><span class="kicker">Oil share</span><h3>Share of power generated from oil</h3></div><svg id="oil-share" role="img" aria-label="Share of power generated from oil"></svg></div>
          <div class="story-copy"><article class="step is-active">
            <h3>Why oil?</h3>
            <p>Oil remains dominant in island power systems because it combines several practical advantages that are difficult to match in remote and fragmented environments.</p>
            <ul class="reasons">
              <li>Flexible to changing demand</li>
              <li>Easy to store and transport across remote ports</li>
              <li>Reliable in isolated locations</li>
            </ul>
          </article>
        </div>
        </div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div></div>
      </div>
      <div class="sticky-story single-stage" data-story="oil-price">
        <div class="story-grid oil-price-stage">
          <div class="visual-panel"><div class="chart-title"><span class="kicker">Brent crude</span><h3>Oil price per barrel since 2010</h3></div><svg id="oil-price" role="img" aria-label="Brent crude oil price over time"></svg></div>
          <div class="story-copy"><article class="step is-active"><h3>A costly connection</h3><p>Oil also comes with significant uncertainty. Fuel prices can change quickly in response to global markets and political events, while supply depends on international trade routes that remote islands cannot control. On top of that, shipping and handling costs add to the already high expense of maintaining an oil-based power system.</p></article></div>
        </div>
        <div class="trigger-stack"><div class="story-trigger" data-step="0"></div></div>
      </div>
    </section>

    <section class="chapter solar-chapter" data-chapter="solar">
      <div class="chapter-heading"><span>03</span><h2>Turning to the Sun</h2></div>
      <div class="scene intro-scene"><p>Solar energy is becoming an increasingly viable way to reduce the Pacific’s dependence on oil without removing it from the energy mix entirely. With solar panels now widely available, relatively simple to install, and well suited to places with abundant sunlight, island nations have more options for diversifying how their electricity is produced.<br><br>As battery storage becomes more affordable and capable, solar power could take on a much larger role in the grid, while oil-based generation continues to provide reliability when conditions require it.</p></div>
      <div class="sticky-story solar-story" data-story="solar">
        <div class="energy-stage">
          <div class="stage-header"><div><span class="kicker">Energy mix</span><h3 id="mix-title">Latest available year</h3><p class="stage-subtitle">Use the slider below the plot to explore other years.</p></div><label for="year-range">Year <output id="year-value"></output></label></div>
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
// Great-circle distance between two lat/long pairs, in kilometres.
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
// Filled in the first time drawMap runs so distances are computed only once.
let islandDistances = null;

function drawMap(coordinates, populationByName, step = 0) {
  const svg = d3.select('#map');
  const width = 920; const height = 572; const marginSide = 74; const marginTop = 55; const pointBottom = 380; const legendY = 496;
  if (svg.attr('viewBox') !== `0 0 ${width} ${height}`) {
    // Built once; later calls only update the data so d3 can transition between steps instead of hard-swapping the DOM.
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.append('rect').attr('class', 'map-water').attr('width', width).attr('height', height);
    svg.append('g').attr('class', 'map-hover');
    svg.append('g').attr('class', 'map-points');
    svg.append('g').attr('class', 'map-labels');
    svg.append('g').attr('class', 'map-legend');
    svg.append('g').attr('class', 'map-population-note');
    svg.append('text').attr('class', 'map-hint').attr('x', marginSide).attr('y', height - 18).attr('text-anchor', 'start');
  }

  const points = coordinates.filter((row) => COUNTRIES.includes(row.country_or_territory));
  const grouped = d3.group(points, (row) => row.country_or_territory);
  const mainRow = (rows) => rows.find((row) => row.location_type === 'country' || row.location_type === 'territory') || rows[0];
  const uniqueRows = (country) => (grouped.get(country) || []).filter((row, index, all) => all.findIndex((candidate) => candidate.normalized_name === row.normalized_name) === index);
  // Coordinates and population name spellings don't always match; try the raw name first, then the normalized one.
  const popOf = (name, altName) => populationByName.get(name) || populationByName.get(altName);
  const countryTotal = (country) => populationByName.get(country)?.value || 0;

  // Longitudes near the antimeridian are unwrapped past 180 so the group lays out in its true relative order.
  const unwrap = (long) => (long < 0 ? long + 360 : long);
  const anchors = COUNTRIES.map((country) => {
    const [lat, long] = mainRow(grouped.get(country) || []).coordinates.split(',').map(numeric);
    return { country, lat, long: unwrap(long) };
  });
  // Positions fill the whole plot while keeping each country's true relative direction from the others.
  const layoutX = d3.scaleLinear(d3.extent(anchors, (d) => d.long), [marginSide, width - marginSide]);
  const layoutY = d3.scaleLinear(d3.extent(anchors, (d) => d.lat), [pointBottom, marginTop]);
  const positions = new Map(anchors.map((d) => [d.country, [layoutX(d.long), layoutY(d.lat)]]));
  const radiusScale = d3.scaleSqrt(d3.extent(COUNTRIES, countryTotal), [14, 46]);
  // Labels are pushed outward from the cluster center so they land clear of the hover distance lines, which run through the middle.
  const centroid = [d3.mean(COUNTRIES, (c) => positions.get(c)[0]), d3.mean(COUNTRIES, (c) => positions.get(c)[1])];
  const lineHeight = 14;
  const labelPosition = (d) => {
    const dx = d.x - centroid[0]; const dy = d.y - centroid[1];
    const offset = 18; const verticalOffset = 26;
    let direction = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'bottom' : 'top');
    const words = d.country.split(' ');
    // Long, multi-word names are wrapped onto their own line so they don't run past the plot edge.
    const approxWidth = Math.max(...words.map((word) => word.length)) * 7.2;
    if (direction === 'right' && d.x + offset + approxWidth > width - marginSide) direction = dy >= 0 ? 'bottom' : 'top';
    if (direction === 'left' && d.x - offset - approxWidth < marginSide) direction = dy >= 0 ? 'bottom' : 'top';
    const anchor = direction === 'right' ? 'start' : direction === 'left' ? 'end' : 'middle';
    const x = direction === 'right' ? d.x + offset : direction === 'left' ? d.x - offset : d.x;
    const blockHeight = (words.length - 1) * lineHeight;
    const y = direction === 'top' ? d.y - verticalOffset - blockHeight : direction === 'bottom' ? d.y + verticalOffset : d.y - blockHeight / 2;
    return { anchor, x, y, words };
  };

  svg.select('.map-hint').text(step === 0 ? 'Hover a country to see the distance between capital islands' : step === 1 ? 'Hover a country to see its population' : step === 2 ? 'Hover an island to see its population' : '');

  if (!islandDistances) {
    islandDistances = {};
    anchors.forEach(({ country: a, lat: latA, long: longA }) => {
      islandDistances[a] = {};
      anchors.forEach(({ country: b, lat: latB, long: longB }) => {
        if (a !== b) islandDistances[a][b] = haversineKm(latA, longA, latB, longB);
      });
    });
  }

  svg.select('.map-legend').selectAll('*').remove();
  if (step >= 1) {
    // Legend sits in its own reserved strip below the plot, spaced by each label's actual width so gaps read as even.
    const charWidth = 7.1;
    const itemGap = 30;
    const widths = COUNTRIES.map((country) => 10 + 7 + country.length * charWidth);
    const totalWidth = d3.sum(widths) + itemGap * (COUNTRIES.length - 1);
    let x = (width - totalWidth) / 2;
    const legend = svg.select('.map-legend');
    COUNTRIES.forEach((country, index) => {
      const item = legend.append('g').attr('transform', `translate(${x},${legendY})`);
      item.append('circle').attr('r', 5).attr('fill', COLORS[country]);
      item.append('text').attr('x', 11).attr('y', 4).text(country);
      x += widths[index] + itemGap;
    });
  }

  const populationNote = svg.select('.map-population-note');
  populationNote.selectAll('*').remove();

  // A stable key per node lets d3 animate size changes and the country-to-islands split, instead of hard-swapping the DOM.
  let nodes;
  if (step === 0) {
    nodes = COUNTRIES.map((country) => ({ key: country, country, x: positions.get(country)[0], y: positions.get(country)[1], r: 12 }));
  } else if (step === 1) {
    nodes = COUNTRIES.map((country) => ({ key: country, country, x: positions.get(country)[0], y: positions.get(country)[1], r: radiusScale(countryTotal(country)) }));
  } else {
    // Samoa's regional survey areas are combined down to its two real islands; every other country keeps one dot per surveyed area.
    const islandGroup = (country, row) => (country === 'Samoa' ? (/savai/i.test(row.normalized_name) ? 'Savaii' : 'Upolu') : row.normalized_name);
    nodes = COUNTRIES.flatMap((country) => {
      const [cx, cy] = positions.get(country);
      const countryRadius = radiusScale(countryTotal(country));
      const rows = uniqueRows(country);
      const islands = rows.filter((row) => row !== mainRow(rows))
        .map((row) => ({ row, pop: popOf(row.input_name, row.normalized_name) }))
        .filter((entry) => entry.pop);
      if (!islands.length) return [{ key: country, country, island: mainRow(rows)?.normalized_name || country, population: countryTotal(country), year: populationByName.get(country)?.year, x: cx, y: cy, r: countryRadius }];
      const total = countryTotal(country) || 1;
      // Each island's area-share of the country's dot in step 2 matches its real share of the country's population.
      const targets = d3.groups(islands, (entry) => islandGroup(country, entry.row)).map(([island, entries]) => {
        const population = d3.sum(entries, (entry) => entry.pop.value);
        const year = d3.max(entries, (entry) => entry.pop.year);
        return { key: `${country}::${island}`, country, island, population, year, x: cx, y: cy, r: countryRadius * Math.sqrt(population / total) };
      });
      const simulation = d3.forceSimulation(targets)
        .force('x', d3.forceX(cx).strength(0.4))
        .force('y', d3.forceY(cy).strength(0.4))
        .force('collide', d3.forceCollide((d) => d.r + 1.5))
        .stop();
      for (let tick = 0; tick < 150; tick += 1) simulation.tick();
      return targets;
    });
  }

  const circles = svg.select('.map-points').selectAll('circle').data(nodes, (d) => d.key).join(
    (enter) => enter.append('circle').attr('cx', (d) => d.x).attr('cy', (d) => d.y).attr('r', 0).attr('fill', (d) => COLORS[d.country])
      .call((selection) => selection.transition().duration(700).attr('r', (d) => d.r)),
    (update) => update.call((selection) => selection.transition().duration(700).attr('cx', (d) => d.x).attr('cy', (d) => d.y).attr('r', (d) => d.r)),
    (exit) => exit.call((selection) => selection.transition().duration(400).attr('r', 0).remove())
  );

  // Renders a rounded, country-tinted frame with a bold title line and a value line beneath it, right-aligned to the plot margin.
  const renderPopulationFrame = (title, value, color) => {
    populationNote.selectAll('*').remove().attr('transform', null);
    const anchorX = width - marginSide; const anchorY = marginTop + 34;
    const text = populationNote.append('text').attr('class', 'map-note-text').attr('text-anchor', 'middle');
    text.append('tspan').attr('x', anchorX).attr('y', anchorY).attr('dy', '-0.5em').attr('font-weight', '700').text(title);
    text.append('tspan').attr('x', anchorX).attr('dy', '1.3em').text(value);
    // Shift the block left by half its measured width so its right edge lands on the plot's inner margin.
    const shiftX = -text.node().getBBox().width / 2;
    text.selectAll('tspan').attr('x', anchorX + shiftX);
    const box = text.node().getBBox();
    const padX = 16; const padY = 10;
    populationNote.insert('rect', 'text')
      .attr('class', 'map-note-frame')
      .attr('x', box.x - padX).attr('y', box.y - padY)
      .attr('width', box.width + padX * 2).attr('height', box.height + padY * 2)
      .attr('rx', 10)
      .attr('fill', color).attr('fill-opacity', 0.3);
  };

  const hoverLayer = svg.select('.map-hover');
  hoverLayer.selectAll('*').remove();
  if (step === 0) {
    const showLinesTo = (country) => {
      const [x1, y1] = positions.get(country);
      hoverLayer.selectAll('*').remove();
      COUNTRIES.filter((other) => other !== country).forEach((other) => {
        const [x2, y2] = positions.get(other);
        hoverLayer.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
        hoverLayer.append('text').attr('x', (x1 + x2) / 2).attr('y', (y1 + y2) / 2).attr('dy', '0.35em').text(`${Math.round(islandDistances[country][other])} km`);
      });
    };
    circles.on('mouseenter', (_event, d) => showLinesTo(d.country)).on('mouseleave', () => hoverLayer.selectAll('*').remove());
  } else if (step === 1) {
    const showPopulationFor = (country) => {
      const year = populationByName.get(country)?.year;
      const value = `${d3.format(',')(Math.round(countryTotal(country)))}${year ? ` (${year})` : ''}`;
      renderPopulationFrame(country, value, COLORS[country]);
    };
    circles.on('mouseenter', (_event, d) => showPopulationFor(d.country)).on('mouseleave', () => populationNote.selectAll('*').remove());
  } else if (step === 2) {
    const showIslandPopulation = (d) => {
      const value = `${d3.format(',')(Math.round(d.population))}${d.year ? ` (${d.year})` : ''}`;
      renderPopulationFrame(`${d.country} \u2013 ${d.island}`, value, COLORS[d.country]);
    };
    circles.on('mouseenter', (_event, d) => showIslandPopulation(d)).on('mouseleave', () => populationNote.selectAll('*').remove());
  } else {
    circles.on('mouseenter', null).on('mouseleave', null);
  }

  const labels = svg.select('.map-labels').selectAll('text').data(step === 0 ? nodes : [], (d) => d.key);
  labels.join(
    (enter) => enter.append('text')
      .attr('text-anchor', (d) => labelPosition(d).anchor)
      .attr('y', (d) => labelPosition(d).y)
      .attr('opacity', 0)
      .each(function each(d) {
        const pos = labelPosition(d);
        d3.select(this).selectAll('tspan').data(pos.words).join('tspan')
          .attr('x', pos.x)
          .attr('dy', (_word, i) => (i === 0 ? '0.32em' : lineHeight))
          .text((word) => word);
      })
      .call((selection) => selection.transition().duration(500).attr('opacity', 1)),
    (update) => update,
    (exit) => exit.call((selection) => selection.transition().duration(300).attr('opacity', 0).remove())
  );
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
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - 70})`).call(d3.axisBottom(x).tickSize(0).tickPadding(16));
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
  svg.append('g').selectAll('text').data(data).join('text').attr('class', 'country-label').attr('x', x(0) - 12).attr('text-anchor', 'end').attr('y', (d) => y(d.country) + y.bandwidth() / 2 + 5).text((d) => d.country);
  data.forEach((d) => { const total = d.solar + d.renewable + d.conventional || 1; let start = 0; [['solar', d.solar], ['renewable', d.renewable], ['conventional', d.conventional]].forEach(([key, value]) => { const pct = (value / total) * 100; svg.append('rect').attr('class', `mix-bar ${key}`).attr('x', x(start)).attr('y', y(d.country)).attr('width', x(start + pct) - x(start)).attr('height', y.bandwidth()).attr('fill', key === 'solar' ? '#efc75e' : key === 'renewable' ? '#4d9b7b' : '#25516b'); start += pct; }); });
}

function activateStory(story, step, coordinates, populationByName) {
  story.dataset.activeStep = step;
  story.querySelectorAll('.step').forEach((node, index) => node.classList.toggle('is-active', index === step));
  story.classList.remove('scene-refresh');
  requestAnimationFrame(() => story.classList.add('scene-refresh'));
  if (story.dataset.story === 'geography') drawMap(coordinates, populationByName, step);
  if (story.dataset.story === 'solar') {
    story.querySelector('.energy-stage').classList.toggle('is-active', step === 0);
    story.querySelector('.closing-scene').classList.toggle('is-active', step === 1);
  }
}

function setupPresentation(coordinates, populationByName) {
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
      activateStory(scene.story, scene.step, coordinates, populationByName);
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
  // Population.csv mixes population counts, household counts and average household size per name with no field telling them apart; the population count is always the largest value.
  const populationByName = d3.rollup(population, (rows) => {
    const best = rows.reduce((a, b) => (numeric(a.OBS_VALUE) > numeric(b.OBS_VALUE) ? a : b));
    return { value: numeric(best.OBS_VALUE), year: best.INDICATOR };
  }, (row) => row['Pacific Island Countries and territories']);
  const years = power.map((row) => numeric(row.TIME_PERIOD)).filter(Boolean); const earliest = d3.min(years) || 2000; const latest = d3.max(years) || earliest;
  const range = document.querySelector('#year-range'); range.min = earliest; range.max = latest; range.value = earliest; document.querySelector('#year-value').textContent = earliest;
  drawMap(coordinates, populationByName); drawOilShare(power); drawOilPrice(oil); drawEnergyMix(power, earliest);
  range.addEventListener('input', (event) => { document.querySelector('#year-value').textContent = event.target.value; drawEnergyMix(power, Number(event.target.value)); });
  setupPresentation(coordinates, populationByName);
}
init().catch((error) => { app.innerHTML += `<p class="error">Could not load the supplied data. ${error.message}</p>`; });
