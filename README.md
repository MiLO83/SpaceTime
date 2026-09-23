# SpaceTime

An interactive WebGL exploration of seeing Earth's past from space. Compare an existing distant telescope, a telescope launched today, and an existing mirror returning a light echo.

The light-sample explorer maps emission dates to outgoing spherical shells at the present time. Move a hypothetical detector independently, match it to a selected year, or calculate an ideal reflector's position and reflection date for a return received at Earth today. This is a geometric model, not a reconstruction of historical imagery or an identified natural reflector.

Run `npm start` and visit http://localhost:8080. Run `npm test` to check the light-travel calculations. No build step or JavaScript dependencies are needed. The entire page works without external asset requests.

The globe is a procedural illustration, not actual geography or historical footage. Dates are calculated in the Earth rest frame with constant distances and idealized constant-speed travel. Sources and assumptions are linked on the page. The visualization supports reduced motion and keeps its controls and results available without WebGL.
