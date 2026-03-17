import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { fetchModels, deleteModel, getThumbnailUrl } from "../services/api";
import { loginRequest } from "../auth/authConfig";
import type { Model3D } from "../types";
import { Plus, Trash2, Download, Heart, LogIn } from "lucide-react";

export default function Library() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (isAuthenticated) {
      loadModels();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  async function loadModels() {
    setLoading(true);
    const all = await fetchModels();
    // Filter to only show models owned by the logged-in user
    const userId =
      accounts[0]?.localAccountId ?? accounts[0]?.homeAccountId ?? "";
    setModels(all.filter((m) => m.authorId === userId || !m.isExploreModel));
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this model?")) return;
    await deleteModel(id);
    setModels(models.filter((m) => m.id !== id));
  }

  async function handleLogin() {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.error("Login failed:", err);
    }
  }

  // Not logged in — show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h1 className="text-xl font-bold text-text-primary">My Library</h1>
        <p className="text-text-secondary text-sm">
          Sign in with your Microsoft account to see your uploaded models.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          <LogIn size={16} /> Sign in with Microsoft
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">My Library</h1>
        <Link
          to="/library/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} /> Upload New Model
        </Link>
      </div>

      {loading ? (
        <div className="text-text-secondary text-center py-12">Loading...</div>
      ) : models.length === 0 ? (
        <div className="text-text-secondary text-center py-12">
          No models uploaded yet. Click "Upload New Model" to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="flex flex-col sm:flex-row gap-4 rounded-xl bg-bg-card border border-border p-4 transition-colors hover:border-accent/20"
            >
              <Link to={`/model/${model.id}`} className="sm:w-48 shrink-0">
                <img
                  src={getThumbnailUrl(model)}
                  alt={model.title}
                  className="w-full aspect-[16/10] object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/model/${model.id}`}
                  className="text-sm font-semibold text-text-primary hover:text-accent transition-colors"
                >
                  {model.title}
                </Link>
                <p className="text-xs text-text-secondary mt-1 truncate">
                  {model.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Download size={12} /> {model.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {model.likes}
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(model.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-text-secondary hover:text-red-400 hover:border-red-400/40 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
