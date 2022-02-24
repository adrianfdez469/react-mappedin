import React, { useState } from 'react';

import { Map } from './mapView';



export const MapParent = props => {

  const [hidden, setShowMap] = useState(true);

  const showMyMap = () => {
    setShowMap(false);
  }
  const hideMyMap = () => {
    setShowMap(true);
    
  }

  return (
    <>
      {hidden 
        ? <button onClick={showMyMap}>Show Map</button> 
        : <Map close={hideMyMap} />
      }
    </>
  );

}