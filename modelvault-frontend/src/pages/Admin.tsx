import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { useUser } from '../contexts/UserContext';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminModels,
  updateUserRole,
  adminDeleteModel,
  getThumbnailUrl,
} from '../services/api';
import type { AdminStats, UserInfo, Model3D } from '../types';
import {
  BarChart3,
  Users,
  Box,
  Settings,
  Download,
  Heart,
  Trash2,
  Search,
  TrendingUp,
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'models', label: 'Models', icon: Box },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Admin() {
  const isAuthenticated = useIsAuthenticated();
  const { isAdmin, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Hard redirect: non-admins never see this page
  if (!isLoading && !isAdmin) {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="text-text-secondary text-center py-12">Loading...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Admin Panel</h1>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-8 border-b border-border pb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-accent text-bg-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'models' && <ModelsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}

// ===== DASHBOARD TAB =====

function DashboardTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-text-secondary py-8">Loading stats...</div>;
  if (!stats) return <div className="text-text-secondary py-8">Failed to load stats.</div>;

  const cards = [
    { label: 'Total Models', value: stats.totalModels, delta: stats.modelsLast7Days, icon: Box, color: 'text-accent' },
    { label: 'Total Users', value: stats.totalUsers, delta: stats.usersLast7Days, icon: Users, color: 'text-highlight' },
    { label: 'Total Downloads', value: stats.totalDownloads, delta: null, icon: Download, color: 'text-blue-400' },
    { label: 'Total Likes', value: stats.totalLikes, delta: null, icon: Heart, color: 'text-pink-400' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-secondary text-sm">{card.label}</span>
              <card.icon size={20} className={card.color} />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {card.value.toLocaleString()}
            </div>
            {card.delta !== null && (
              <div className="flex items-center gap-1 mt-1 text-xs text-accent">
                <TrendingUp size={12} />
                +{card.delta} last 7 days
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Overview</h3>
        <p className="text-text-secondary text-sm">
          {stats.modelsLast30Days} models uploaded in the last 30 days.
          {' '}{stats.usersLast30Days} new users joined.
        </p>
      </div>
    </div>
  );
}

// ===== USERS TAB =====

function UsersTab() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: number, newRole: number) {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  }

  const roleBadge = (role: number) => {
    switch (role) {
      case 0:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-600/30 text-gray-400">Guest</span>;
      case 1:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-accent/15 text-accent">User</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-highlight/15 text-highlight">Admin</span>;
      default:
        return null;
    }
  };

  if (loading) return <div className="text-text-secondary py-8">Loading users...</div>;

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary text-left">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
              <td className="px-5 py-3 text-text-primary">{u.displayName || '—'}</td>
              <td className="px-5 py-3 text-text-secondary">{u.email}</td>
              <td className="px-5 py-3">{roleBadge(u.role)}</td>
              <td className="px-5 py-3">
                {u.id === currentUser?.id ? (
                  <span className="text-xs text-text-secondary">You</span>
                ) : (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                    className="bg-input-bg border border-border rounded-lg px-2 py-1 text-xs text-text-primary"
                  >
                    <option value={0}>Guest</option>
                    <option value={1}>User</option>
                    <option value={2}>Admin</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-text-secondary text-center py-8">No users found.</div>
      )}
    </div>
  );
}

// ===== MODELS TAB =====

function ModelsTab() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setLoading(true);
    try {
      const data = await fetchAdminModels(search || undefined);
      setModels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadModels();
  }

  async function handleDelete(id: number) {
    try {
      await adminDeleteModel(id);
      setModels((prev) => prev.filter((m) => m.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Failed to delete model:', err);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-input-bg border border-border text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </form>

      {loading ? (
        <div className="text-text-secondary py-8">Loading models...</div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary text-left">
                <th className="px-5 py-3 font-medium">Thumbnail</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Downloads</th>
                <th className="px-5 py-3 font-medium">Likes</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                  <td className="px-5 py-2">
                    <img
                      src={getThumbnailUrl(model)}
                      alt={model.title}
                      className="w-12 h-8 object-cover rounded"
                    />
                  </td>
                  <td className="px-5 py-3 text-text-primary font-medium">{model.title}</td>
                  <td className="px-5 py-3 text-text-secondary">{model.authorName}</td>
                  <td className="px-5 py-3 text-text-secondary">{model.category}</td>
                  <td className="px-5 py-3 text-text-secondary">{model.downloads}</td>
                  <td className="px-5 py-3 text-text-secondary">{model.likes}</td>
                  <td className="px-5 py-3">
                    {confirmDelete === model.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 text-xs rounded border border-border text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(model.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete model"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {models.length === 0 && (
            <div className="text-text-secondary text-center py-8">No models found.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== SETTINGS TAB =====

function SettingsTab() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
      <Settings size={40} className="mx-auto text-text-secondary mb-4" />
      <h3 className="text-lg font-semibold text-text-primary mb-2">Site Settings</h3>
      <p className="text-text-secondary text-sm">
        Site configuration, featured models, announcements, and ad provider settings will be available here soon.
      </p>
    </div>
  );
}
