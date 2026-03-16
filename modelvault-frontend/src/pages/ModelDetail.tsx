import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchModel, likeModel, getDownloadUrl, getThumbnailUrl } from '../services/api';
import type { Model3D } from '../types';
import { Download, Heart, FileType, Calendar } from 'lucide-react';

export default function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<Model3D | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchModel(Number(id))
        .then(setModel)
        .catch(() => setModel(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleLike() {
    if (!model) return;
    await likeModel(model.id);
    setModel({ ...model, likes: model.likes + 1 });
  }

  if (loading) return <div className="text-text-secondary text-center py-12">Loading...</div>;
  if (!model) return <div className="text-text-secondary text-center py-12">Model not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-xl overflow-hidden border border-border mb-6">
        <img
          src={getThumbnailUrl(model)}
          alt={model.title}
          className="w-full aspect-[16/9] object-cover"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{model.title}</h1>
          <p className="text-text-secondary text-sm mt-1">by {model.authorName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
          >
            <Heart size={16} /> {model.likes.toLocaleString()}
          </button>
          <a
            href={getDownloadUrl(model.id)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            <Download size={16} /> Download
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-6">
        <span className="flex items-center gap-1.5">
          <Download size={14} /> {model.downloads.toLocaleString()} downloads
        </span>
        <span className="flex items-center gap-1.5">
          <Heart size={14} /> {model.likes.toLocaleString()} likes
        </span>
        {model.category && (
          <span className="flex items-center gap-1.5">
            <FileType size={14} /> {model.category}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {new Date(model.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Tags */}
      {model.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {model.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {model.description && (
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Description</h2>
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{model.description}</p>
        </div>
      )}
    </div>
  );
}
