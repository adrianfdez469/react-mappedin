import { useEffect, useRef } from 'react';
import  { createPortal } from 'react-dom';
import { getVenue, showVenue, E_SDK_EVENT } from '@mappedin/mappedin-js';
import { venueData } from '../../utils/constants/mapConstants';
import '@mappedin/mappedin-js/lib/mappedin.css';
import './mapView.css';


export const Map = (props) => {  
  const mapDivRef = useRef();
  const selectRef = useRef();
  mapDivRef.current = document.createElement("div");
  mapDivRef.current.style.cssText = "position: fixed; top: 0; left: 0; width: 100%;";
  
  
  const createLevelSelector = (venue, mapView) => {
    // Creando el select para seleccionar los niveles
    selectRef.current = document.createElement("select");
    mapDivRef.current.appendChild(selectRef.current);
    selectRef.current.style.cssText = "position: fixed; top: 1rem; right: 1rem; min-width: 10%";
    
    const maps = venue.maps.sort((a,b) => b.elevation - a.elevation);
    
    selectRef.current.onchange = (event) => {
      const id = event.target.value;
      mapView.setMap(id);
      mapView.labelAllLocations();
    };

    maps.forEach(map => {
      const option = document.createElement("option");
      option.text = map.shortName;
      option.value = map.id;

      selectRef.current.add(option);
    });
    selectRef.current.value = mapView.currentMap.id;
  };
  
  useEffect(() => {

    document.body.appendChild(mapDivRef.current);

    (async () => {
      const venue = await getVenue(venueData);
      const mapView = await showVenue(mapDivRef.current, venue);
      mapView.addInteractivePolygonsForAllLocations();
      mapView.labelAllLocations({ flatLabels: true });

      const location = venue.locations.find(l => l.name === "Parking Lot B")
      console.log(location.polygons)
      if (location.polygons[0] !== null) {
        const label = mapView.labelPolygon(location.polygons[0], {
          text: "Your car",
          appearance: {
            text: {
              foregroundColor: "#ffb702",
              backgroundColor: "#0a0a0a",
            },
          },
        })
        label.enable()
      }

      const startLocation = venue.locations.find(
        location => location.name === "Cleo"
      )
      const endLocation = venue.locations.find(
        location => location.id === "583f2479d7737330da0e380d"
      )
    
      const directions = startLocation.directionsTo(endLocation)
      mapView.Journey.draw(directions)
      
      
      // Cuando se selecciona un poligono se marca del color indicado
      mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => {
        mapView.setPolygonColor(polygon, "#BF4320");
        const location = mapView.getPrimaryLocationForPolygon(polygon);
        if (!location) return;
        mapView.removeAllMarkers()
        const { name, logo, id } = location;
        console.log(id);
    
        const markerTemplate = `
          <div class="marker">
            <img src="${logo?.original}" />
            <p>${name}</p>
            <p>${id}</p>
          </div>`;
    
        mapView.createMarker(polygon.entrances[0], markerTemplate);
      });
      // Se quitan todos los colores de los poligonos marcados
      mapView.on(E_SDK_EVENT.NOTHING_CLICKED, polygon => {
        mapView.clearAllPolygonColors();
        mapView.removeAllMarkers()
      });
      createLevelSelector(venue, mapView);

      
    })();

    return () => {
      document.body.removeChild(mapDivRef.current);
      //document.body.removeChild(selectRef.current);
    }

  }, []);

  return createPortal(props.children, document.body);
  
};

const createMapDivContainer = () => {
  const mapDivContainer = document.createElement("div");

  // select para seleccionar el piso
  const levelSelectNavigator = document.createElement("select");
  mapDivContainer.appendChild(levelSelectNavigator);
  levelSelectNavigator.style.cssText = "position: fixed; top: 1rem; right: 1rem; min-width: 10%";

  
  

  

  
  return {
    mapDivContainer,
    levelSelectNavigator
  };
}