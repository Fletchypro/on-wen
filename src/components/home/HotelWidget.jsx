import React, { useEffect, useRef } from 'react';

const HotelWidget = () => {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwgts.com/content?trs=438793&shmarker=652689&lang=www&layout=S10409&powered_by=true&campaign_id=121&promo_id=4038";
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

export default HotelWidget;