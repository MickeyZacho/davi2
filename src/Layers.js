import { ScatterplotLayer, TextLayer } from "deck.gl";

export default props => {
  const { data, color } = props;

  const layers = [
    new ScatterplotLayer({
      id: "scatter-layer",
      data,
      opacity: 0.2,
      stroked: true,
      filled: true,
      radiusMinPixels: 1,
      radiusMaxPixels: 1000,
      lineWidthMinPixels: 1,
      getRadius: d => Math.sqrt(d.exits),
      getFillColor: color,
      getLineColor: color,
      getPosition: d => (d.position)
    }),];

  return layers;
};
