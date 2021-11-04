import { ScatterplotLayer, TextLayer } from "deck.gl";

export default props => {
  const { data } = props;

  const layers = [
    new ScatterplotLayer({
      id: "scatter-layer",
      data,
      opacity: 0.5,
      stroked: true,
      filled: true,
      radiusMinPixels: 5,
      radiusMaxPixels: 1000,
      lineWidthMinPixels: 1,
      getRadius: d => Math.sqrt(d.exits),
      getFillColor: d => [255, 0, 0],
      getLineColor: d => [255, 0, 0],
      getPosition: d => (d.position)
    }),];

  return layers;
};
