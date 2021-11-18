import { ScatterplotLayer, TextLayer } from "deck.gl";

export default props => {
  const { data, color, size, opacity } = props;

  const layers = [
    new ScatterplotLayer({
      id: "scatter-lays",
      data,
      opacity: opacity,
      stroked: true,
      filled: true,
      radiusMinPixels: size,
      radiusMaxPixels: 1000,
      lineWidthMinPixels: 1,
      pickable: true,
      getRadius: d => Math.sqrt(d.exits),
      getFillColor: color,
      getLineColor: color,
      getPosition: d => (d.position)
    }),
  ];

  return layers;
};