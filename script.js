// script.js
const world = Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundColor('#000')
  .showAtmosphere(true)
  .atmosphereColor('#fff')
  .atmosphereAltitude(0.25)
  (document.getElementById('globeViz'));

// Enable globe rotation with trackpad/mouse
world.controls().enableZoom = true; // allow zooming with trackpad
world.controls().enableRotate = true; // allow rotation with trackpad/mouse
world.controls().enablePan = false; // optional: disable panning
world.controls().update();

// Optional: Add country polygons (or dots, arcs, etc.)
fetch('https://unpkg.com/world-atlas@2/countries-110m.json').then(res => res.json()).then(worldData => {
  const countries = topojson.feature(worldData, worldData.objects.countries).features;

  world
    .polygonsData(countries)
    // Use satellite imagery for each country polygon cap
    .polygonCapColor(() => {
      // Use a texture fill for satellite imagery
      // Since globe.gl does not support per-polygon image textures directly,
      // we simulate satellite color by sampling the globe's texture color at the polygon centroid.
      // For a more realistic effect, you can use a color approximation or a library like chroma.js.
      // Here, we'll use a fixed color as a placeholder for "satellite" look:
      return 'rgba(70, 130, 180, 0.7)'; // steelblue, looks like satellite water/land
    })
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#fff')
    .polygonLabel(({ properties: d }) => {
      // Prefer the 'name' property if available, otherwise use 'NAME' or 'ADMIN'
      // For islands, world-atlas topojson often provides the real island name in 'name'
      // For countries, 'name' is usually the country name
      // You can also check for 'NAME' or 'ADMIN' if 'name' is missing
      const islandOrCountry =
        d.name && d.name !== d.ADMIN ? d.name : (d.ADMIN || d.name || 'Unknown');
      return `<b>${islandOrCountry}</b>`;
    })
    .onPolygonHover(hoverD => {
      document.getElementById('infoBox').style.display = hoverD ? 'block' : 'none';
      if (hoverD) {
        document.getElementById('infoBox').innerHTML = `<strong>${hoverD.properties.name}</strong>`;
      }
    })
    .onPolygonClick(country => {
      if (!country || !country.id) return; // id is usually the ISO code
      const countryCode = country.id;
      fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then(res => res.json())
        .then(data => {
          const infoBox = document.getElementById('infoBox');
          if (Array.isArray(data) && data.length > 0) {
            const c = data[0];
            infoBox.innerHTML = `
              <h2>${c.name.common}</h2>
              <p><strong>Capital:</strong> ${c.capital ? c.capital[0] : 'N/A'}</p>
              <p><strong>Population:</strong> ${c.population.toLocaleString()}</p>
              <p><strong>Area:</strong> ${c.area.toLocaleString()} km²</p>
              <p><strong>Region:</strong> ${c.region}</p>
              <p><strong>Languages:</strong> ${c.languages ? Object.values(c.languages).join(', ') : 'N/A'}</p>
              <p><strong>Currencies:</strong> ${c.currencies ? Object.values(c.currencies).map(cur => cur.name).join(', ') : 'N/A'}</p>
            `;
            infoBox.style.display = 'block';
          } else {
            infoBox.innerHTML = `<strong>No data found for ${countryCode}</strong>`;
            infoBox.style.display = 'block';
          }
        })
        .catch(() => {
          const infoBox = document.getElementById('infoBox');
          infoBox.innerHTML = `<strong>Error fetching data for ${countryCode}</strong>`;
          infoBox.style.display = 'block';
        });
    });
});

world.arcsData([
  {
    startLat: 48.8566, startLng: 2.3522, // Paris
    endLat: 35.6895, endLng: 139.6917,  // Tokyo
    color: ['#00ffff', '#ff00ff']
  }
])
.arcStroke(0.5)
.arcAltitude(0.2)
.arcColor('color')
.arcDashLength(0.4)
.arcDashGap(2)
.arcDashAnimateTime(4000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
// Removed erroneous .globeImageUrl('./assets/earth.jpg') line
infoBox.innerHTML = `
  <h2><img src="${c.flags.svg}" alt="${c.name.common} flag" width="32"> ${c.name.common}</h2>
  <p><strong>Capital:</strong> ${c.capital ? c.capital[0] : 'N/A'}</p>
  <p><strong>Population:</strong> ${c.population.toLocaleString()}</p>
  <p><strong>Area:</strong> ${c.area.toLocaleString()} km²</p>
  <p><strong>Region:</strong> ${c.region}</p>
  <p><strong>Languages:</strong> ${c.languages ? Object.values(c.languages).join(', ') : 'N/A'}</p>
  <p><strong>Currencies:</strong> ${c.currencies ? Object.values(c.currencies).map(cur => cur.name).join(', ') : 'N/A'}</p>
`;
const clickSound = new Audio('https://example.com/click.mp3');

world
  // ...other chained methods...
  .onPolygonHover(hoverD => {
    const infoBox = document.getElementById('infoBox');
    if (hoverD) {
      const props = hoverD.properties;
      const countryName = props.name && props.name !== props.ADMIN ? props.name : (props.ADMIN || 'Unknown');
      infoBox.innerHTML = `<strong>${countryName}</strong>`;
      infoBox.style.display = 'block';
    } else {
      infoBox.style.display = 'none';
    }
  })
  .onPolygonClick(country => {
    clickSound.play();
    if (!country || !country.id) return;
    const countryCode = country.id;
    fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then(res => res.json())
      .then(data => {
        const infoBox = document.getElementById('infoBox');
        if (Array.isArray(data) && data.length > 0) {
          const c = data[0];
          infoBox.innerHTML = `
            <h2><img src="${c.flags.svg}" alt="${c.name.common} flag" width="32"> ${c.name.common}</h2>
            <p><strong>Capital:</strong> ${c.capital ? c.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${c.population.toLocaleString()}</p>
            <p><strong>Area:</strong> ${c.area.toLocaleString()} km²</p>
            <p><strong>Region:</strong> ${c.region}</p>
            <p><strong>Languages:</strong> ${c.languages ? Object.values(c.languages).join(', ') : 'N/A'}</p>
            <p><strong>Currencies:</strong> ${c.currencies ? Object.values(c.currencies).map(cur => cur.name).join(', ') : 'N/A'}</p>
          `;
          infoBox.style.display = 'block';
        } else {
          infoBox.innerHTML = `<strong>No data found for ${countryCode}</strong>`;
          infoBox.style.display = 'block';
        }
      })
      .catch(() => {
        const infoBox = document.getElementById('infoBox');
        infoBox.innerHTML = `<strong>Error fetching data for ${countryCode}</strong>`;
        infoBox.style.display = 'block';
      });
  });
fetch('https://restcountries.com/v3.1/all')
  .then(res => res.json())
  .then(data => {
    const markers = data
      .filter(c => c.capitalInfo && c.capitalInfo.latlng)
      .map(c => ({
        lat: c.capitalInfo.latlng[0],
        lng: c.capitalInfo.latlng[1],
        country: c.name.common,
        capital: c.capital ? c.capital[0] : 'N/A'
      }));

    world
      .pointsData(markers)
      .pointLat(d => d.lat)
      .pointLng(d => d.lng)
      .pointAltitude(0.02)
      .pointColor(() => '#00faff')
      .pointRadius(0.5)
      .pointLabel(d => `<b>${d.capital}</b> (${d.country})`);
  });
    world
    .showAtmosphere(true)
    .atmosphereColor('#00faff')
    .atmosphereAltitude(0.3)
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

document.getElementById('closeInfoBox').onclick = function() {
  document.getElementById('infoBox').style.display = 'none';
};
document.getElementById('loadingSpinner').style.display = 'none';
