
import React from 'react';
import type { Language } from '../types';
import type { Crop } from '../types';
import { useTranslate } from '../hooks/useTranslate';

interface CropCardProps {
  crop: Crop;
  language: Language;
  index: number;
}

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="font-semibold text-gray-800 dark:text-gray-100">{value || 'N/A'}</p>
  </div>
);

const CropCard: React.FC<CropCardProps> = ({ crop, language, index }) => {
  const t = useTranslate(language);
  
  return (
    <div 
      className="crop-card-container bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] duration-300 flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{crop.emoji || '🌱'}</span>
            <div className="flex-grow">
                <h4 className="text-xl font-bold text-primary">{crop.cropName}</h4>
                {crop.scientificName && <p className="text-sm text-gray-500 dark:text-gray-400 italic">{crop.scientificName}</p>}
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm flex-grow">{crop.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
          <DetailItem label={t('plantingSeason')} value={crop.plantingSeason} />
          <DetailItem label={t('waterNeeds')} value={crop.waterNeeds} />
          <DetailItem label={t('marketValue')} value={crop.marketValue} />
          <DetailItem label={t('soilPreference')} value={crop.soilPreference} />
        </div>
      </div>
    </div>
  );
};

export default CropCard;