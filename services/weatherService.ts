import { CityWeather } from '../types';
import { fetchTextWithProxy } from './rssService';

const WEATHER_URL = 'https://www.mgm.gov.tr/FTPDATA/analiz/sonSOA.xml';

export const fetchWeatherData = async (): Promise<CityWeather[]> => {
  try {
    const xmlText = await fetchTextWithProxy(WEATHER_URL);
    if (!xmlText) return [];

    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    // MGM XML structure typically has <sehirler> nodes
    // <sehirler>
    //   <ili>ADANA</ili>
    //   <Durum>Az Bulutlu</Durum>
    //   <Mak>35</Mak>
    // </sehirler>

    const cities = Array.from(xml.querySelectorAll('sehirler'));
    
    return cities.map(cityNode => {
      const city = cityNode.querySelector('ili')?.textContent || '';
      const status = cityNode.querySelector('Durum')?.textContent || '';
      const maxTemp = cityNode.querySelector('Mak')?.textContent || '';

      return {
        city,
        status,
        maxTemp
      };
    }).filter(w => w.city && w.maxTemp); // Filter out empty entries
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
};