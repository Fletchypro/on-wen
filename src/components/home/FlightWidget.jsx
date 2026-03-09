import React, { useEffect, useRef } from 'react';

const FlightWidget = () => {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwgts.com/content?trs=438793&shmarker=652689&locale=en&curr=USD&powered_by=true&border_radius=30&plain=false&color_button=%232681ff&color_button_text=%23ffffff&color_border=%232681ff&promo_id=4132&campaign_id=121";
    script.async = true;
    script.charset = "utf-8";

    const container = widgetContainerRef.current;
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return <div ref={widgetContainerRef}></div>;
};

export default FlightWidget;