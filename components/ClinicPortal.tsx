
import React, { useState, useMemo } from 'react';
import { Clinic } from '../types';

interface ClinicPortalProps {
  clinics: Clinic[];
  onSelectClinic: (clinic: Clinic) => void;
}

const ClinicPortal: React.FC<ClinicPortalProps> = ({ clinics, onSelectClinic }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(clinics.map(c => c.specialty)));
    return ['All', ...cats];
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            c.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || c.specialty === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [clinics, search, activeCategory]);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-4 tracking-tight">
          Find Your <span className="text-ecura-500">Ecura Connect</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mb-8">
          The fastest way to book appointments with world-class specialists. Direct chat booking, zero waiting.
        </p>

        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1 group">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ecura-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by clinic name or specialty..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-ecura-100 focus:border-ecura-500 transition-all outline-none text-slate-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-ecura-500 text-white shadow-lg shadow-ecura-200' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {filteredClinics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClinics.map((clinic) => (
            <div 
              key={clinic.id} 
              className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100 overflow-hidden"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={clinic.image} 
                  alt={clinic.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-ecura-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-widest">
                    {clinic.specialty}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(clinic.rating) ? 'fill-current' : 'opacity-30'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold">{clinic.rating} ({clinic.reviews})</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-navy mb-2 group-hover:text-ecura-600 transition-colors">{clinic.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{clinic.description}</p>
                
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 bg-slate-50 p-2 rounded-xl">
                  <svg className="w-4 h-4 text-ecura-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="truncate">{clinic.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {clinic.doctors.map((dr) => (
                      <div key={dr.id} className="relative">
                        <img 
                          src={dr.avatar} 
                          className="w-10 h-10 rounded-full border-4 border-white object-cover" 
                          alt={dr.name} 
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => onSelectClinic(clinic)}
                    className="bg-ecura-500 hover:bg-ecura-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-ecura-100 group/btn active:scale-95"
                  >
                    <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.584 3.914 1.574 5.43l-.973 3.535 3.633-.954zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-100 p-8 rounded-full mb-6 text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No clinics found</h3>
          <p className="text-slate-500 max-w-sm">Try adjusting your search or category filter.</p>
          <button 
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="mt-6 text-ecura-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ClinicPortal;