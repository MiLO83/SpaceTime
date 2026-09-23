const $ = id => document.getElementById(id);
const now = new Date().getFullYear();
const scale = 180 / 150;
let returning = false;
const rings = $('sample-rings');
for (const distance of [25, 50, 75, 100, 125, 150]) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  for (const [key, value] of Object.entries({cx:230,cy:205,r:distance*scale})) circle.setAttribute(key,value);
  rings.append(circle);
}
function updateSample() {
  const age = Number($('sample-age').value);
  const distance = Number($('detector-distance').value);
  const selectedYear = now - age;
  const match = distance === age;
  const markerDistance = returning ? age / 2 : distance;
  const x = 230 + markerDistance * scale;
  $('sample-age-value').textContent = `${age} years · Earth in ${selectedYear}`;
  $('detector-distance-value').textContent = `${distance} ly`;
  $('detector-controls').hidden = returning;
  $('direct-sample').setAttribute('aria-pressed', String(!returning));
  $('return-sample').setAttribute('aria-pressed', String(returning));
  $('target-shell').setAttribute('r', age * scale);
  $('target-shell').style.strokeDasharray = returning ? '4 6' : 'none';
  $('sample-detector').setAttribute('cx', x);
  $('sample-detector').setAttribute('fill', returning || match ? '#a6ebd0' : '#f4c47c');
  $('detector-label').setAttribute('x', x);
  $('detector-label').textContent = returning ? 'Reflector' : distance === 0 ? 'Detector at Earth' : 'Detector';
  $('return-path').setAttribute('d', returning ? `M230 197 L${x} 197 L${x} 213 L230 213` : '');
  $('shell-label').textContent = `${selectedYear} light: ${age} ly from Earth today if unreflected`;
  $('sample-result-label').textContent = returning ? 'EARTH RECEIVES THIS YEAR’S LIGHT TODAY' : 'THIS DETECTOR RECEIVES EARTH YEAR';
  $('sample-year').textContent = returning ? selectedYear : now - distance;
  $('sample-result').textContent = returning
    ? `Required ideal reflector: ${age / 2} ly away. Reflection in ${now - age / 2}. Total path: ${age / 2} + ${age / 2} = ${age} ly.`
    : match ? `Match: this detector intercepts the selected ${selectedYear} light today. No return trip is needed to view it there.`
    : `The selected ${selectedYear} light is ${age} ly away today. This detector is ${distance} ly away, receiving a different time sample.`;
  $('map-note').textContent = returning
    ? 'Solid arrows: a hypothetical reflected route ending at Earth today. Dashed circle: where the unreflected light continues outward.'
    : 'Mint circle: selected emission year. Dot: detector. Use the distance slider to sample different Earth years at the same present time.';
  $('sample-verdict').textContent = returning
    ? 'This solves the travel-time geometry, not the engineering. A reflector must already exist, direct light back, and preserve enough information for an image. No usable reflector is identified by this model. A focal point alone does not supply this return path.'
    : 'Distance selects the time sample only when the detector is actually there. Adjusting aim or focus at Earth does not move the detector to the selected shell. A telescope focuses the light that reaches its aperture.';
  $('map-desc').textContent = `${$('shell-label').textContent}. ${$('sample-result').textContent}`;
}
for (const id of ['sample-age', 'detector-distance']) $(id).addEventListener('input', updateSample);
$('direct-sample').addEventListener('click', () => { returning = false; updateSample(); });
$('return-sample').addEventListener('click', () => { returning = true; updateSample(); });
$('match-shell').addEventListener('click', () => { $('detector-distance').value = $('sample-age').value; updateSample(); });
$('home-detector').addEventListener('click', () => { $('detector-distance').value = 0; updateSample(); });
updateSample();
