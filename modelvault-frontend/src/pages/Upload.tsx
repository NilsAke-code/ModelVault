import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { createModel } from "../services/api";
import { loginRequest } from "../auth/authConfig";
import { Upload as UploadIcon, FileBox, Image, LogIn } from "lucide-react";

const CATEGORIES = [
  "Education",
  "Art",
  "Gadgets",
  "Household",
  "Tools",
  "Toys & Games",
  "Mechanical",
  "Miniatures",
];

export default function Upload() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const modelInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

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
        <h1 className="text-xl font-bold text-text-primary">
          Upload New Model
        </h1>
        <p className="text-text-secondary text-sm">
          Sign in with your Microsoft account to upload models.
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modelFile) {
      setError("Please select a 3D model file.");
      return;
    }
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("modelFile", modelFile);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tags", tags);

    try {
      const { id } = await createModel(formData);
      navigate(`/model/${id}`);
    } catch {
      setError("Failed to upload model. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Upload New Model
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Model file drop zone */}
        <div
          onClick={() => modelInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-border hover:border-accent/40 cursor-pointer transition-colors bg-input-bg"
        >
          <FileBox size={32} className="text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {modelFile
              ? modelFile.name
              : "Click to select 3D model file (STL, 3MF)"}
          </p>
          <input
            ref={modelInputRef}
            type="file"
            accept=".stl,.3mf"
            onChange={(e) => setModelFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        {/* Thumbnail drop zone */}
        <div
          onClick={() => thumbInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/40 cursor-pointer transition-colors bg-input-bg"
        >
          <Image size={28} className="text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {thumbnail
              ? thumbnail.name
              : "Click to select thumbnail image (optional)"}
          </p>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="px-4 py-2.5 rounded-lg bg-input-bg border border-border text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-accent transition-colors"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="px-4 py-2.5 rounded-lg bg-input-bg border border-border text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-accent transition-colors resize-y"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-input-bg border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-input-bg border border-border text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-accent transition-colors"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          <UploadIcon size={16} />
          {submitting ? "Uploading..." : "Upload Model"}
        </button>
      </form>
    </div>
  );
}
