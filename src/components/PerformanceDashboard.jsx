import React, { useState, useEffect } from 'react';
import { onLCP, onCLS, onFCP, onTTFB } from 'web-vitals';
import { cn } from '@/lib/utils';
import { Activity, X, ChevronDown } from 'lucide-react';

const MetricCard = ({ name, value, rating, unit }) => {
  const getColor = (rating) => {
    switch (rating) {
      case 'good': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'needs-improvement': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'poor': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  return (
    <div className={cn("p-2 rounded-lg border text-xs font-mono mb-2", getColor(rating))}>
      <div className="flex justify-between items-center">
        <span className="font-bold">{name}</span>
        <span>{rating?.toUpperCase() || 'WAITING'}</span>
      </div>
      <div className="text-lg font-bold mt-1">
        {value === null ? '...' : value}
        <span className="text-[10px] ml-1 opacity-70">{unit}</span>
      </div>
    </div>
  );
};

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    LCP: { value: null, rating: null },
    CLS: { value: null, rating: null },
    FCP: { value: null, rating: null },
    TTFB: { value: null, rating: null }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    onLCP((m) => setMetrics(prev => ({ ...prev, LCP: { value: Math.round(m.value), rating: m.rating } })));
    onCLS((m) => setMetrics(prev => ({ ...prev, CLS: { value: m.value.toFixed(3), rating: m.rating } })));
    onFCP((m) => setMetrics(prev => ({ ...prev, FCP: { value: Math.round(m.value), rating: m.rating } })));
    onTTFB((m) => setMetrics(prev => ({ ...prev, TTFB: { value: Math.round(m.value), rating: m.rating } })));
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      <div className={cn(
        "bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden",
        isOpen ? "w-64" : "w-12 h-12 rounded-full cursor-pointer hover:bg-black/90"
      )}>
        {isOpen ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Activity size={16} className="text-purple-400" />
                <span>Web Vitals</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <ChevronDown size={14} />
                </button>
                <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-red-400 p-1">
                  <X size={14} />
                </button>
              </div>
            </div>
            
            <MetricCard name="LCP" value={metrics.LCP.value} rating={metrics.LCP.rating} unit="ms" />
            <MetricCard name="CLS" value={metrics.CLS.value} rating={metrics.CLS.rating} unit="" />
            
            <div className="mt-4 pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
               <div className="text-[10px] text-gray-400">
                 <span className="block font-bold text-white">FCP</span>
                 {metrics.FCP.value || '...'} ms
               </div>
               <div className="text-[10px] text-gray-400 text-right">
                 <span className="block font-bold text-white">TTFB</span>
                 {metrics.TTFB.value || '...'} ms
               </div>
            </div>
          </div>
        ) : (
            <div onClick={() => setIsOpen(true)} className="w-full h-full flex items-center justify-center text-purple-400">
                <Activity size={20} />
            </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;