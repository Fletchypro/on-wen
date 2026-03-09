import React, { useEffect, useRef } from 'react';

const CarWidget = () => {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwgts.com/content?trs=438793&shmarker=652689&locale=en&powered_by=true&border_radius=30&plain=true&show_logo=true&color_background=%23F6F6F5ff&color_button=%231358D7ff&color_text=%23000000&color_input_text=%23000000&color_button_text=%23ffffff&promo_id=4480&campaign_id=10";
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

export default CarWidget;