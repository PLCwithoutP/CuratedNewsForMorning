import React, { useEffect, useState } from 'react';
import { CityWeather } from '../types';
import { fetchWeatherData } from '../services/weatherService';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog,
  ThermometerSun
} from 'lucide-react';

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchWeatherData();
      setWeatherData(data);
      setLoading(false);
    };
    load();
    
    // Refresh weather every 30 minutes
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (status: string) => {
    const s = status.toLowerCase();
    
    if (s.includes('açık') || s.includes('güneş')) return <Sun className="w-4 h-4 text-orange-500" />;
    if (s.includes('parçalı') || s.includes('az bulutlu')) return <CloudSun className="w-4 h-4 text-yellow-500" />;
    if (s.includes('yağmur') || s.includes('sağanak')) return <CloudRain className="w-4 h-4 text-blue-500" />;
    if (s.includes('gök gürültü')) return <CloudLightning className="w-4 h-4 text-purple-500" />;
    if (s.includes('kar')) return <CloudSnow className="w-4 h-4 text-cyan-400" />;
    if (s.includes('sis') || s.includes('pus')) return <CloudFog className="w-4 h-4 text-slate-400" />;
    if (s.includes('bulut')) return <Cloud className="w-4 h-4 text-slate-500" />;
    
    return <Sun className="w-4 h-4 text-orange-400" />; // Default
  };

  if (loading) {
    return (
      <div className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-200 h-48 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) return null;

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-64 flex-shrink-0">
      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <ThermometerSun className="w-4 h-4 text-orange-600" />
        <h3 className="font-bold text-slate-800 text-sm">Türkiye Weather</h3>
      </div>
      
      <div className="overflow-y-auto scrollbar-thin p-1">
        {weatherData.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-700 w-24 truncate" title={item.city}>
                {item.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 truncate max-w-[60px] text-right" title={item.status}>
                {item.status}
              </span>
              {getWeatherIcon(item.status)}
              <span className="font-bold text-xs text-slate-800 w-6 text-right">
                {item.maxTemp}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;