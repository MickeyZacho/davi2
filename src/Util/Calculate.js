import { Delaunay } from "d3-delaunay";
import { kdTree } from "kd-tree-javascript";

export function calculateVor(data) {
    //const point = data.map(d => d.position);
    const delau = Delaunay.from(
      data,
      (d) => d.position[0],
      (d) => d.position[1]
    );

    const vor = delau.voronoi([-179, -89, 179, 89]);

    const it = vor.cellPolygons();
    let res = it.next();

    const kdt = new kdTree(
      [],
      (a, b) =>
        Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)),
      ["lat", "lng"]
    );
    //console.log(kdt)
    data.forEach((e) => {
      let nPos = e.position;
      let entry = {
        lng: nPos[0],
        lat: nPos[1],
        cityName: e.CityName,
        country: e.country,
        cityPos: e.cityPos
      };
      kdt.insert(entry);
    });

    const lineMap = new Map();
    let cityLines = new Map();

    while (!res.done) {
      //For every cell in the voronoi, calculate the corresponding hotel, by looking in the kd-tree of hotels
      let averageX =
        res.value.reduce((acc, c) => acc + c[0], 0) / res.value.length;
      let averageY =
        res.value.reduce((acc, c) => acc + c[1], 0) / res.value.length;

      let near = kdt.nearest({ lng: averageX, lat: averageY }, 1)[0][0]; //returns a hotel data point {lng, lat, cityName, country}

      for (let i = 0; i < res.value.length; i++) {
        //Calculate all lines drawn, for a cell, including the last element to the first element
        let posA = res.value[i];
        let posB = res.value[(i + 1) % res.value.length];
        //Create a path object, with the corresponding city and country of the hotel
        let path = {
          a: posA,
          b: posB,
          cityName: near.cityName,
          country: near.country,
          cityPos: near.cityPos
        };
        //Check for wierd case, where start and end position is the same
        if (posA[0] === posB[0] && posA[1] === posB[1]) continue;
        //Check if path is on the border
        if (
          (posA[0] === 179 && posB[0] === 179) ||
          (posA[0] === -179 && posB[0] === -179) ||
          (posA[1] === 89 && posB[1] === 89) ||
          (posA[1] === -89 && posB[1] === -89)
        ) {
          if (cityLines.get(near.cityName) === undefined)
            cityLines.set(near.cityName, []);
          cityLines
            .get(near.cityName)
            .push({ a: posA, b: posB, sameCountry: true , cityPos: near.cityPos});
          continue;
        }
        //Identify a path by the sum of the lat and long values, hopefully being unique, for faster search, and to equal a path from a to b and from b to a
        let a = posA[0] + posA[1];
        let b = posB[0] + posB[1];
        let id = "" + posA[0] + posA[1] + posB[0] + posB[1]
        if (a < b) id = "" + posB[0] + posB[1] + posA[0] + posA[1]
        let nPath = lineMap.get(id)
        if (nPath === undefined)
          lineMap.set(id, path);
        //When inserting, we return null if there wasn't an already existing element, otherwise we return the already existing, meaning we found a match
        //Check if the city of the found path is different from the current cell, otherwise we don't want to draw the path

        if (nPath === undefined || nPath.cityName === near.cityName) continue;
        //If city path array not initialised, initialize them
        if (cityLines.get(near.cityName) === undefined)
          cityLines.set(near.cityName, []);
        if (cityLines.get(nPath.cityName) === undefined)
          cityLines.set(nPath.cityName, []);
        //Add the path to the cityLines, and check if the line splits two countries
        cityLines
          .get(near.cityName)
          .push({
            a: posA,
            b: posB,
            sameCountry: near.country === nPath.country,
            cityPos: near.cityPos 
          });
        cityLines
          .get(nPath.cityName)
          .push({
            a: nPath.a,
            b: nPath.b,
            sameCountry: near.country == nPath.country,
            cityPos: nPath.cityPos
          });
      }
      res = it.next();
    }
    return cityLines;
  }
export function calculatePolygons(data) {
    //let polygonMap = new Map();
    let polys = []
    data.forEach((value, key) => {
      //console.log(key);
      //if(key === "No City") return []
      let entry = value[0];
      value.splice(value.indexOf(entry), 1);
      let polyCount = 0;
      let currentPos = entry.b;
      let path = [];
      path.push([entry.a, entry.b]);
      do {
        let next = value.find((e) => {
          return e.a[0] === currentPos[0] && e.a[1] === currentPos[1];
        });

        if (next !== undefined) {
          value.splice(value.indexOf(next), 1);
          path[polyCount].push(next.b);
          currentPos = next.b;
        } else {
          polys.push({CityName: key, polygon: path[polyCount], cityPos: entry.cityPos})
          
          //console.log(value);
          //path[polyCount].push(entry.a)
          entry = value[0];
          value.splice(value.indexOf(entry), 1);
          currentPos = entry.b;
          path.push([entry.a, entry.b]);
          polyCount += 1;
        }
        polys.push({CityName: key, polygon: path[polyCount], cityPos: entry.cityPos})
      } while (value.length > 0);

      //console.log(path);
     // polygonMap.set(key, path);
      //polygonMap.set(key, path);
    });
    //testing code
    //let polys = []
    //polygonMap.forEach(value => value.forEach(v => polys.push(v)))
    return polys;
    //return polygonMap;
  }
export function combineProc(dataA, dataB){
    let hotelMap = new Map()
    dataA.forEach(hotel =>{
        let h = {
            hotelId: hotel.hotelId,
            country: hotel.country,
            lng: hotel.position[0],
            lat: hotel.position[1],
            position: hotel.position,
            CityNameA: hotel.CityName,
            cityPosA: hotel.cityPos}
        hotelMap.set(hotel.hotelId, h)
    })
    dataB.forEach((hotel)=>{
        let h = hotelMap.get(hotel.hotelId)
        h.CityNameB = hotel.CityName
        h.CityPosB = hotel.CityPos
        h.sameCity = h.CityNameA === h.CityNameB
    })

    let hotelArray = Array.from(hotelMap.values())
    const delau = Delaunay.from(
      hotelArray,
      (d) => d.position[0],
      (d) => d.position[1]
    );
    
    const vor = delau.voronoi([-179, -89, 179, 89]);

    const it = vor.cellPolygons();
    let res = it.next();

    const kdt = new kdTree(
      [],
      (a, b) =>
        Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)),
      ["lat", "lng"]
    );
    hotelArray.forEach((e) => {
      kdt.insert(e);
    });

    let polys = []
    while (!res.done) {
      //For every cell in the voronoi, calculate the corresponding hotel, by looking in the kd-tree of hotels
      let averageX =
        res.value.reduce((acc, c) => acc + c[0], 0) / res.value.length;
      let averageY =
        res.value.reduce((acc, c) => acc + c[1], 0) / res.value.length;

      let near = kdt.nearest({ lng: averageX, lat: averageY }, 1)[0][0]; //returns a hotel data point {lng, lat, cityName, country}
      near.polygon = res.value
      polys.push(near)
      res = it.next();
    }
    console.log(polys)
    return polys
}