
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Language } from '../types';
import { useTranslate } from '../hooks/useTranslate';
import { useGeolocation } from '../hooks/useGeolocation';
import { getCropRecommendations } from '../services/geminiService';
import type { Crop, FormData } from '../types';
import CropCard from './CropCard';
import LoadingSpinner from './LoadingSpinner';
import Map from './Map';

interface RecommendationFormProps {
  language: Language;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ language }) => {
  const t = useTranslate(language);
  const { data: geoData, loading: geoLoading, getGeolocation } = useGeolocation();
  const [formData, setFormData] = useState<FormData>({
    latitude: null,
    longitude: null,
    locationName: '',
    soilType: '',
    climate: '',
    cost: '',
  });

  const [recommendations, setRecommendations] = useState<Crop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);
  
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  
  const handleLocationUpdate = useCallback(async (lat: number, lon: number) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const data = await response.json();
        const locationName = data.display_name || 'Unknown Location';
        setLocationInput(locationName);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon, locationName }));
    } catch (e) {
        console.error("Reverse geocoding failed", e);
        const locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        setLocationInput(locationName);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon, locationName }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetectLocation = useCallback(() => {
    getGeolocation();
  }, [getGeolocation]);

  useEffect(() => {
    if (geoData.latitude && geoData.longitude) {
      handleLocationUpdate(geoData.latitude, geoData.longitude);
    }
  }, [geoData, handleLocationUpdate]);
  
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setIsSuggestionsOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error);
    }
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = window.setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };
  
  const handleSuggestionClick = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setLocationInput(suggestion.display_name);
    setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        locationName: suggestion.display_name,
    }));
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const result = await getCropRecommendations(formData, thinkingMode, language);
      setRecommendations(result);
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recommendations.length > 0) {
      const refetchInNewLanguage = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await getCropRecommendations(formData, thinkingMode, language);
          setRecommendations(result);
        } catch (err) {
          setError(t('error'));
          setRecommendations([]);
        } finally {
          setLoading(false);
        }
      };
      refetchInNewLanguage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const soilTypes = [{ value: "loam", label: t('soilLoam') }, { value: "clay", label: t('soilClay') }, { value: "sandy", label: t('soilSandy') }, { value: "silt", label: t('soilSilt') }, { value: "peat", label: t('soilPeat') }];
  const climateTypes = [{ value: "tropical", label: t('climateTropical') }, { value: "dry", label: t('climateDry') }, { value: "temperate", label: t('climateTemperate') }, { value: "continental", label: t('climateContinental') }];
  const costTypes = [{ value: "low", label: t('costLow') }, { value: "medium", label: t('costMedium') }, { value: "high", label: t('costHigh') }];

  return (
    <section id="recommendations" className="scroll-mt-20">
      <div className="max-w-5xl mx-auto bg-white dark:bg-dark-surface p-6 md:p-10 rounded-2xl shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">{t('recommendationTitle')}</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">{t('recommendationSubtitle')}</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="locationName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">{t('location')}</label>
              <div className="flex gap-2">
                <input type="text" name="locationName" id="locationName" value={locationInput} onChange={handleLocationInputChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary" placeholder={t('locationSearchPlaceholder')} autoComplete="off" />
                <button type="button" onClick={handleDetectLocation} disabled={geoLoading} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 flex-shrink-0">
                  {geoLoading ? '...' : t('detectLocation')}
                </button>
              </div>
              {isSuggestionsOpen && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li key={i} onClick={() => handleSuggestionClick(s)} className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-sm">
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label htmlFor="cost" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">{t('costOfCultivation')}</label>
              <select name="cost" id="cost" value={formData.cost} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                <option value="" disabled>{t('selectCost')}</option>
                {costTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="soilType" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">{t('soilType')}</label>
              <select name="soilType" id="soilType" value={formData.soilType} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                <option value="">{t('selectSoil')}</option>
                {soilTypes.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="climate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">{t('climate')}</label>
              <select name="climate" id="climate" value={formData.climate} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                <option value="">{t('selectClimate')}</option>
                {climateTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                <input
                    type="checkbox"
                    id="thinkingMode"
                    checked={thinkingMode}
                    onChange={(e) => setThinkingMode(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                    <label htmlFor="thinkingMode" className="font-medium text-gray-900 dark:text-gray-100">{t('thinkingMode')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('thinkingModeDescription')}</p>
                </div>
            </div>
            <div>
              <button type="submit" disabled={loading || !formData.locationName || !formData.cost} className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-md shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-surface disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed transition-all duration-300 ease-in-out">
                {loading ? (thinkingMode ? t('loadingDeepAnalysis') : t('loadingRecommendations')) : t('getRecommendations')}
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center min-h-[300px] relative">
            <Map 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                onLocationSelect={handleLocationUpdate}
                language={language}
            />
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">{t('recommendationsFor')} <span className="text-primary">{formData.locationName}</span></h3>
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((crop, index) => (
                <CropCard key={index} crop={crop} language={language} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationForm;