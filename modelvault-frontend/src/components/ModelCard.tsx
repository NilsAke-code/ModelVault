import { Link } from 'react-router-dom';
import { Download, Heart } from 'lucide-react';
import type { Model3D } from '../types';
import { getThumbnailUrl } from '../services/api';

export default function ModelCard({ model }: { model: Model3D }) {
  return (
    <Link
      to={`/model/${model.id}`}
      className="group block rounded-xl bg-bg-card border border-border overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/20"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={getThumbnailUrl(model)}
          alt={model.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-text-primary truncate">{model.title}</h3>
        <p className="text-xs text-text-secondary mt-1">{model.authorName}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Download size={13} /> {model.downloads.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={13} /> {model.likes.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
