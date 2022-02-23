import { useEffect, useRef } from 'react';
import  { createPortal } from 'react-dom';
import { getVenue, showVenue, E_SDK_EVENT } from '@mappedin/mappedin-js';
import { venueData } from '../../utils/constants/mapConstants';
import '@mappedin/mappedin-js/lib/mappedin.css';
import './mapView.css';

const mapDOMel = document.getElementById("mappedin-map");



export const Map = (props) => {  
  const divRef = useRef();
  const selectRef = useRef();
  divRef.current = document.createElement("div");
  
  
  const createLevelSelector = (venue, mapView) => {
    // Creando el select para seleccionar los niveles
    selectRef.current = document.createElement("select");
    document.body.appendChild(selectRef.current);
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
    mapDOMel.appendChild(divRef.current);

    (async () => {
      const venue = await getVenue(venueData);
      const mapView = await showVenue(divRef.current, venue);
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
        location => location.name === "American Eagle"
      )
    
      const directions = startLocation.directionsTo(endLocation)
      mapView.Journey.draw(directions)
      
      
      // Cuando se selecciona un poligono se marca del color indicado
      mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => {
        mapView.setPolygonColor(polygon, "#BF4320");
        const location = mapView.getPrimaryLocationForPolygon(polygon);
        if (!location) return;
        mapView.removeAllMarkers()
        const { name, logo } = location;
    
        const markerTemplate = `
          <div class="marker">
            <img src="${logo?.original}" />
            <p>${name}</p>
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
      mapDOMel.removeChild(divRef.current);
      document.body.removeChild(selectRef.current);
    }

  }, []);

  return createPortal(props.children, mapDOMel);
  
};