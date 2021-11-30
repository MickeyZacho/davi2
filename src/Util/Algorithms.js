import { ClosestCity } from "../algorithms/closestCity.js";
import { BiggestInRadius } from "../algorithms/BiggestInRadius.js";

export const AlgorithmsEnum = {
  BiggestInRadius: "Biggest in Radius", 
  ClosestCity: "Closest City",
  PopRadius: "Biggest in Radius scaled by Population"
}

export default class Algorithms {
  static algorithmStateSwitch(algorithm, cityData, hotelData){
    switch(algorithm){
      case AlgorithmsEnum.BiggestInRadius:
        BiggestInRadius.Process(cityData, hotelData)
        break;
      case AlgorithmsEnum.ClosestCity:
        ClosestCity.Process(cityData, hotelData)
        break;
      case AlgorithmsEnum.PopRadius:
        break;
    }
  }

  static parameterStateSwitch(props){
    switch(props.algorithm){
      case AlgorithmsEnum.BiggestInRadius:
        return BiggestInRadius.getParameters()
      case AlgorithmsEnum.ClosestCity:
        return ClosestCity.getParameters()
      case AlgorithmsEnum.PopRadius:
        return null
    }
  }
}