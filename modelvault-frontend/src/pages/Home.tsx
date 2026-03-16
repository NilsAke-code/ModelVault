import { useEffect, useState } from 'react';
import { fetchModels, fetchCategories } from '../services/api';
import type { Model3D } from '../types';
import ModelCard from '../components/ModelCard';

const QUICK_FILTERS = ['For You', 'Trending', 'Education', 'Gadgets', 'Toys & Games'];

export default function Home() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [activeFilter, setActiveFilter] = useState('For You');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, [activeFilter]);

  async function loadModels() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeFilter === 'Trending') params.sort = 'downloads';
    else if (activeFilter !== 'For You') params.category = activeFilter;
    const data = await fetchModels(params);
    setModels(data);
    setLoading(false);
  }

  return (
    <div>
      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
              activeFilter === filter
                ? 'bg-accent text-bg-primary'
                : 'border border-border text-text-secondary hover:text-text-primary hover:border-accent/40'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Model grid */}
      {loading ? (
        <div className="text-text-secondary text-center py-12">Loading models...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {models.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}

      {!loading && models.length === 0 && (
        <div className="text-text-secondary text-center py-12">No models found.</div>
      )}
    </div>
  );
}
