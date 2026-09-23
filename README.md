# SpaceTime

An interactive WebGL exploration of seeing Earth's past from space. Compare an existing distant telescope, a telescope launched today, and an existing mirror returning a light echo.

Run `npm start` and visit http://localhost:8080. Run `npm test` to check the light-travel calculations. No build step or JavaScript dependencies are needed. The entire page works without external asset requests.

The globe is a procedural illustration, not actual geography or historical footage. Dates are calculated in the Earth rest frame with constant distances and idealized constant-speed travel. Sources and assumptions are linked on the page. The visualization supports reduced motion and keeps its controls and results available without WebGL.
