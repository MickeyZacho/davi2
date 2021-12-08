import React, { useEffect, useState } from "react";
import DeckGL, {
  WebMercatorViewport,
  SolidPolygonLayer,
  PolygonLayer,
  HeatmapLayer,
} from "deck.gl";
import MapGL, { _useMapControl as useMapControl } from "react-map-gl";
import renderLayers from "./Layers.js";
import { CountryFinder } from "./algorithms/CountryFinder.js";
import { Delaunay } from "d3-delaunay";
import { kdTree } from "kd-tree-javascript";
import * as d3 from "d3";
import Box from "@mui/material/Box";
import { Button, Slider } from "@mui/material";
import RadioButtons from "./components/algorithmselector.js";
import Settings from "./components/sideParameters";
import { AlgorithmsEnum } from "./Util/Algorithms.js";
import { red, blue } from "@mui/material/colors";
import Algorithms from "./Util/Algorithms.js";
import {
  calculatePolygons,
  calculateVor,
  combineProc,
} from "./Util/Calculate.js";
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./worldcities3.csv";
const HOTEL_URL = "./hotelsout/";
const DATA_PATH = "./CountryPop/";

const COLOR_HOTEL = [166, 206, 227];
const COLOR_CITY = [178, 223, 138];
const COLOR_FIRST_ALGORITHM = [27, 158, 119];
const COLOR_SECOND_ALGORITHM = [117, 112, 179];
const COLOR_PROBLEM_AREA = [217, 95, 2];

export default () => {
  const [data, setData] = useState([]);
  const [hotelData, setHotelData] = useState([]);
  const [countryHotelData, setCountryHotelData] = useState([]);
  const [countryCityData, setCountryCityData] = useState([]);

  const [processedData, setProcData] = useState([]);
  const [processedData2, setProcData2] = useState([]);
  const [vorData, setVorData] = useState([]);
  const [vorData2, setVorData2] = useState([]);
  const [polData, setPolData] = useState([]);
  const [polData2, setPolData2] = useState([]);
  const [combData, setCombData] = useState([]);
  const [posToCountry, setPosToCountry] = useState({});
  const [curCountry, setCurCountry] = useState({});
  const [sliderProps, setSliderProps] = useState({
    value: 20,
    handleChange: (event, newValue) => {
      setSliderProps((s) => ({
        ...s,
        value: newValue,
      }));
    },
  });
  const defaultParams = {
    biggestInRadius: { radius: 50 },
    closestCity: {
      scale: 1,
    },
    biggestPopScale: {
      scale: 0.08,
    },
  };
  const [firstAlgorithmValue, setFirstAlgorithmValue] = useState({
    value: AlgorithmsEnum.BiggestInRadius,
    parameters: { radius: 50 },
    handleChangeParam: (event, newParam) => {
      setFirstAlgorithmValue((s) => ({
        ...s,
        parameters: newParam,
      }));
    },

    handleChangeSelected: (event, newValue) => {
      switch (newValue) {
        case AlgorithmsEnum.BiggestInRadius:
          setFirstAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestInRadius,
            value: newValue,
          }));
          break;
        case AlgorithmsEnum.ClosestCity:
          setFirstAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.closestCity,
            value: newValue,
          }));
          break;
        case AlgorithmsEnum.PopRadius:
          setFirstAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestPopScale,
            value: newValue,
          }));
          break;
      }
    },
  });
  const [secondAlgorithmValue, setSecondAlgorithmValue] = useState({
    value: AlgorithmsEnum.ClosestCity,
    parameters: {},
    handleChangeParam: (event, newParam) => {
      setSecondAlgorithmValue((s) => ({
        ...s,
        parameters: newParam,
      }));
    },
    handleChangeSelected: (event, newValue) => {
      //console.log("Got here")

      switch (newValue) {
        case AlgorithmsEnum.BiggestInRadius:
          setSecondAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestInRadius,
            value: newValue,
          }));
          break;
        case AlgorithmsEnum.ClosestCity:
          setSecondAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.closestCity,
            value: newValue,
          }));
          break;
        case AlgorithmsEnum.PopRadius:
          setSecondAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestPopScale,
            value: newValue,
          }));
          break;
      }
    },
  });

  const [sideParameterCitySetting, setSideParameterCitySetting] = useState({
    value: true,
    handleChange: (event, newValue) => {
      setSideParameterCitySetting({
        handleChange: sideParameterCitySetting.handleChange,
        value: newValue,
      });
    },
  });
  const [sideParameterHotelSetting, setsideParameterSettings] = useState({
    value: true,
    handleChange: (event, newValue) => {
      setsideParameterSettings({
        handleChange: sideParameterHotelSetting.handleChange,
        value: newValue,
      });
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const countries = [
        "Denmark",
        "Sweden",
        "Norway",
        "Hong Kong",
        "Singapore",
        "Liechtenstein",
        "Luxembourg",
        "Iceland",
        "Turkey",
        "Poland",
        "Finland",
        "Netherlands",
        "Greece",
        "Germany",
        "United States",
        "United Kingdom",
        "Ireland",
        "France",
        "Spain",
        "Portugal",
        "Korea, South",
        "China",
        "Indonesia",
        "Belgium",
        "Italy",
        "Austria",
        "Slovakia",
        "Hungary",
        "Romania",
        "Moldova",
        "Serbia",
        "Bosnia And Herzegovina",
        "Slovenia",
        "Czechia",
        "Switzerland",
        "Macedonia",
        "Albania",
        "Bulgaria",
        "Kosovo",
        "Croatia",
        "Ukraine",
        "Belarus",
        "Lithuania",
        "Latvia",
        "Estonia",
        "Georgia",
        "Japan",
        "Thailand",
        "Taiwan",
        "Vietnam",
        "Philippines",
        "Romania",
        "Malaysia",
        "India",
        "Canada",
        "Cambodia",
        "Laos",
      ];
      let result = [];
      for (var i = 0; i < countries.length; i++) {
        await d3.csv(DATA_PATH + countries[i] + ".csv").then((data) => {
          for (var j = 0; j < data.length; j++) {
            if (data[j].population < 10000) continue;
            result.push(data[j]);
          }
        });
      }
      const points = result.map(function (d) {
        //console.log(d);
        //console.log(d.city)
        return {
          CityName: d.city,
          position: [+d.lng, +d.lat],
          population: +d.population,
          country: d.country,
        };
      });
      const finalpoints = points.filter((point) => point.population !== "");
      //console.log("GOT HERE");
      setData(finalpoints);
    };

    const fetchData2 = async () => {
      let result = [];
      var counter = 0;
      for (var i = 0; i < 291; i++) {
        await d3.json(HOTEL_URL + "hotels" + i + ".json").then((data) => {
          for (var j = 0; j < data.Hotels.length; j++) {
            //if(data.Hotels[j].Latitude>100 || data.Hotels[j].Latitude<-100) continue
            result.push(data.Hotels[j]);
            counter++;
          }
        });
      }
      //console.log("This was also reached");
      //console.log("counter: " + counter);
      const points = result.map(function (d) {
        //console.log(d);
        //console.log(d.city)

        return {
          hotelId: d.id,
          position: [+d.Longitude, +d.Latitude],
          country: d.Country,
        };
      });
      //console.log("GOT HERE");
      setHotelData(points);
      setPosToCountry(new CountryFinder(points));
    };

    fetchData();
    fetchData2();
  }, []);

  useEffect(() => {
    console.log("Calculating");

    let procData = Algorithms.algorithmStateSwitch(
      firstAlgorithmValue.value,
      countryCityData,
      countryHotelData,
      firstAlgorithmValue.parameters
    );
    let procData2 = Algorithms.algorithmStateSwitch(
      secondAlgorithmValue.value,
      countryCityData,
      countryHotelData,
      secondAlgorithmValue.parameters
    );

    let vor1 = calculateVor(procData);
    let vor2 = calculateVor(procData2);
    let pol1 = calculatePolygons(vor1);
    let pol2 = calculatePolygons(vor2);

    let combine = combineProc(procData, procData2);

    setProcData(procData);
    setProcData2(procData2);
    setVorData(vor1);
    setVorData2(vor2);
    setPolData(pol1);
    setPolData2(pol2);
    setCombData(combine);
  }, [
    countryCityData,
    countryHotelData,
    firstAlgorithmValue,
    secondAlgorithmValue,
  ]);

  useEffect(() => {
    try {
      let filteredHotels = hotelData.filter((e) => e.country === curCountry);
      let filteredCities = data.filter((e) => e.country === curCountry);
      setCountryCityData(filteredCities);
      setCountryHotelData(filteredHotels);
    } catch {}
  }, [curCountry]);
  // The height of the bottom part of the visualization scales lineary with how many algorithms exists in the enum + 50 because of the title
  const nonMapHeight = Object.keys(AlgorithmsEnum).length * 50 + 50;
  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: window.innerWidth,
      height: window.innerHeight - 20,
      longitude: -3.2943888952729092,
      latitude: 53.63605986631115,
      zoom: 4,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
    })
  );
  useEffect(() => {
    if (viewport.zoom < 6) return;
    try {
      //console.log(curCountry)
      let position = [viewport.longitude, viewport.latitude];
      let country = posToCountry.query(position);
      if (country !== curCountry) {
        setCurCountry(country);
      }
    } catch {}

    //console.log("Check country This is run");
  }, [viewport]);

  //resize
  useEffect(() => {
    const handleResize = () => {
      setViewport((v) => {
        return {
          ...v,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const sliderPropValue1 = 1 - sliderProps.value / 100;
  const sliderPropValue2 = sliderProps.value / 100;
  console.log("First algo: " + sliderPropValue1);
  console.log("Second algo: " + sliderPropValue2);
  const zoomed = viewport.zoom >= 6;
  const layers = [
    new PolygonLayer({
      id: "polygon-layer3",
      data: combData,
      stroked: false,
      filled: true,
      wireframe: false,
      visible: zoomed,
      opacity: 0.5,
      extruded: false,
      pickable: true,
      lineWidthMinPixels: 1,
      getPolygon: (d) => d.polygon,
      getFillColor: (d) => [
        COLOR_PROBLEM_AREA[0],
        COLOR_PROBLEM_AREA[1],
        COLOR_PROBLEM_AREA[2],
        d.sameCity ? 0 : 30,
      ],
      getLineColor: [0, 0, 0],
      getLineWidth: 1,
      highlightColor: [0, 0, 255, 20],
      autoHighlight: true,
      onHover: (info) => handleOnHover(info),
    }),
    new PolygonLayer({
      id: "polygon-layer",
      data: polData,
      stroked: true,
      wireframe: false,
      visible: zoomed,
      extruded: false,
      pickable: false,
      opacity: sliderPropValue1,
      lineWidthMinPixels: 1,
      getPolygon: (d) => d.polygon,
      getFillColor: [0, 0, 0, 0],
      getLineColor: [
        COLOR_FIRST_ALGORITHM[0],
        COLOR_FIRST_ALGORITHM[1],
        COLOR_FIRST_ALGORITHM[2],
      ],
      getLineWidth: 1,
      highlightColor: [255, 0, 0, 20],
      autoHighlight: true,
      //onHover: (info) => handleOnHover(info),
    }),
    new PolygonLayer({
      id: "polygon-layer2",
      data: polData2,
      stroked: true,
      wireframe: false,
      visible: zoomed,
      extruded: false,
      pickable: false,
      opacity: sliderPropValue2,
      lineWidthMinPixels: 1,
      getPolygon: (d) => d.polygon,
      getFillColor: [0, 0, 0, 0],
      getLineColor: [
        COLOR_SECOND_ALGORITHM[0],
        COLOR_SECOND_ALGORITHM[1],
        COLOR_SECOND_ALGORITHM[2],
      ],
      getLineWidth: 1,
      highlightColor: [0, 0, 255, 20],
      autoHighlight: true,
      //onHover: (info) => handleOnHover(info),
    }),
    renderLayers({
      data: countryCityData,
      color: COLOR_CITY,
      size: 5,
      opacity: 1,
      visible: zoomed && sideParameterCitySetting.value,
    }),
    renderLayers({
      data: processedData,
      color: COLOR_HOTEL,
      size: 2,
      opacity: 1,
      visible: zoomed && sideParameterHotelSetting.value,
    }),
    new HeatmapLayer({
      id: "heatmapLayer",
      data: hotelData,
      getPosition: (d) => d.position,
      getWeight: 1,
      aggregation: "SUM",
      visible: !zoomed,
    }),
  ];

  function handleOnHover(info) {
    const { x, y, object } = info;
    let polygonStatsA = document.getElementById("polygonStatsA");
    let polygonStatsB = document.getElementById("polygonStatsB");
    if (object) {
      polygonStatsA.innerHTML = `
        <div><b>First: </b>${object.CityNameA}</div>
      `;

      polygonStatsB.innerHTML = `
        <div><b>Second: </b>${object.CityNameB}</div>
      `;
    }
  }
  /*<svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}>
            <Voronoi5
              viewport={viewport}
              data={polData}
              opacity={sliderProps.value / 100}
              colorString={"blue"}
            />
            <Voronoi5
              viewport={viewport}
              data={polData2}
              opacity={1 - sliderProps.value / 100}
              colorString={"red"}
            />
        <Voronoi5 viewport={viewport} data={polData} opacity={sliderProps.value / 100} colorString={"blue"}/>
        <Voronoi5 viewport={viewport} data={polData2} opacity={1-sliderProps.value / 100} colorString={"red"}/>
          </svg>*/

  return (
    <div>
      <div>
        <MapGL
          {...viewport}
          mapStyle={"mapbox://styles/mapbox/light-v10"}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          preventStyleDiffing={false}
          onViewportChange={(v) => setViewport(new WebMercatorViewport(v))}
          text-allow-overlap={false}
        >
          <svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}></svg>
          <DeckGL
            layers={layers}
            initialViewState={viewport}
            controller={true}
          />
        </MapGL>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minWidth: "100wh",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 200,
              height: viewport.height - nonMapHeight - 100,
              top: 10,
              right: 10,
              display: "flex",
              justifyContent: "left",
              alignItems: "top",
              marginLeft: 50,
              marginBottom: 20,
              opacity: 1,
              backgroundColor: "white",

              borderRadius: "25px",
              border: "2px solid #4c768d",
            }}
          >
            <Settings
              citySetting={sideParameterCitySetting.value}
              hotelSetting={sideParameterHotelSetting.value}
              changeCityValue={sideParameterCitySetting.handleChange}
              changeHotelValue={sideParameterHotelSetting.handleChange}
              cityColor={COLOR_CITY}
              hotelColor={COLOR_HOTEL}
            />
          </div>

          <div
            style={{
              position: "absolute",
              width: "90vw",
              height: nonMapHeight,
              bottom: 10,
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "flex-start",
              opacity: 1,
              borderRadius: "25px",
              border: "2px solid #4c768d",
              backgroundColor: "white",
            }}
          >
            <div class="item">
              <Algorithms.parameterStateSwitch
                algorithm={firstAlgorithmValue.value}
                onClick={firstAlgorithmValue.handleChangeParam}
              />
            </div>
            <div class="item">
              <RadioButtons
                buttonColor={COLOR_FIRST_ALGORITHM}
                title="First Algorithm"
                changeValue={firstAlgorithmValue.handleChangeSelected}
                startValue={firstAlgorithmValue.value}
              />
            </div>
            <div class="item">
              Transparency
              <Slider
                value={sliderProps.value}
                aria-label="Slider"
                onChange={sliderProps.handleChange}
                track={false}
                step={5}
                marks={[
                  {
                    value: 25,
                    label: "50%",
                  },
                  {
                    value: 50,
                    label: "100%",
                  },
                  {
                    value: 75,
                    label: "50%",
                  },
                ]}
              />
            </div>
            <div class="item">
              <RadioButtons
                buttonColor={COLOR_SECOND_ALGORITHM}
                title="Second Algorithm"
                changeValue={secondAlgorithmValue.handleChangeSelected}
                startValue={secondAlgorithmValue.value}
              />
            </div>
            <div class="item">
              <Algorithms.parameterStateSwitch
                algorithm={secondAlgorithmValue.value}
                onClick={secondAlgorithmValue.handleChangeParam}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        id="tooltip"
        style={{ position: "absolute", zIndex: 1, pointerEvents: "none" }}
      />
    </div>
  );
};
