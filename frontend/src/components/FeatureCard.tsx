import type { ReactNode } from 'react';
import Button from './Button';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  buttonText: string;
  onButtonClick: () => void;
}

function FeatureCard({
  title,
  description,
  icon,
  iconBgColor,
  iconColor,
  buttonText,
  onButtonClick
}: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mr-4`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button
        variant="primary"
        onClick={onButtonClick}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
}

export default FeatureCard;
