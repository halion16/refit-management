'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export default function SampleDataBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Controlla se ci sono dati di esempio caricati
    const locations = localStorage.getItem('refit_locations');
    const projects = localStorage.getItem('refit_projects');

    if (locations && projects) {
      try {
        const locationData = JSON.parse(locations);
        const projectData = JSON.parse(projects);

        if (locationData.length > 0 && projectData.length > 0) {
          setDataLoaded(true);

          // Mostra il banner solo se non è stato nascosto precedentemente
          const bannerHidden = localStorage.getItem('sample_data_banner_hidden');
          if (!bannerHidden) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Errore lettura dati:', error);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('sample_data_banner_hidden', 'true');
  };

  if (!isVisible || !dataLoaded) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-400 mr-3" />
          <div>
            <p className="text-sm text-blue-700">
              <strong>Dati di esempio caricati!</strong> Stai visualizzando un set completo di dati demo che include:
            </p>
            <ul className="text-xs text-blue-600 mt-1 ml-2">
              <li>• 4 Locations (Milano Duomo, Roma Corso, Outlet Serravalle, Sede Centrale)</li>
              <li>• 3 Progetti (Ristrutturazione Roma in corso, Upgrade Milano, Espansione Outlet)</li>
              <li>• 3 Fornitori qualificati con rating e specializzazioni</li>
              <li>• 3 Preventivi con condizioni di pagamento e tracking completo</li>
            </ul>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-blue-400 hover:text-blue-600"
          title="Nascondi questo messaggio"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}