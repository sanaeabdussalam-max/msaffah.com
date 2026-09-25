import React from 'react';

interface ResultCardProps {
  business: {
    name: string;
    category: string;
    zone: string;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    languages: string[];
    priceLevel: number;
    isOpen: boolean;
    mobileService: boolean;
  };
}

const ResultCard: React.FC<ResultCardProps> = ({ business }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Verified Badge */}
      {business.isVerified && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
          Verified
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{business.name}</h3>
          <p className="text-gray-500 text-sm font-medium">{business.category} • Musaffah {business.zone}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="font-bold">{business.rating}</span>
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{business.reviewCount} Reviews</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 text-[11px] font-bold uppercase tracking-wide">
        <span className={business.isOpen ? "text-green-600" : "text-red-500"}>
          {business.isOpen ? "● Open Now" : "○ Closed"}
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">{business.languages.join(", ")}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">{"$".repeat(business.priceLevel)}</span>
        {business.mobileService && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Mobile Service</span>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors">
          Call
        </button>
        <button className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm transition-colors">
          WhatsApp
        </button>
      </div>
      <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
        Get a Quote
      </button>
    </div>
  );
};

export default ResultCard;
