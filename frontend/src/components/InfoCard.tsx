import type { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  onButtonClick?: () => void;
}

function InfoCard({ title, description, icon, iconBgColor, iconColor, onButtonClick }: InfoCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300 ${
        onButtonClick ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''
      }`}
      onClick={onButtonClick}
    >
      <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

export default InfoCard;
