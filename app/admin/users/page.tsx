"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Users,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings2,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  monthlyAuditCount: number;
  createdAt: string;
  subscriptionEndsAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PLANS = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editingPlan, setEditingPlan] = useState<{
    user: AdminUser;
    plan: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/users", {
        params: { page, limit: 20 },
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.name?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleEditPlan = async () => {
    if (!editingPlan) return;
    setActionLoading(true);
    try {
      await axios.patch(
        `/api/admin/users/${editingPlan.user.id}/plan`,
        { plan: editingPlan.plan }
      );
      setEditingPlan(null);
      fetchUsers();
    } catch {}
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await axios.delete(`/api/admin/users/${deletingId}`);
      setDeletingId(null);
      fetchUsers();
    } catch {}
    setActionLoading(false);
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: "bg-zinc-100 text-zinc-700",
      STARTER: "bg-blue-100 text-blue-700",
      PRO: "bg-indigo-100 text-indigo-700",
      ENTERPRISE: "bg-amber-100 text-amber-700",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[plan] ?? colors.FREE}`}
      >
        {plan}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800">Users</h1>
          <p className="mt-1 text-zinc-500">
            Manage platform users.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-zinc-300"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-6 py-4 font-semibold text-zinc-600">Name</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Email</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Plan</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Role</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Joined</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/50"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-800">
                      {user.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{user.email}</td>
                    <td className="px-6 py-4">{getPlanBadge(user.plan)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingUser(user)}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setEditingPlan({ user, plan: user.plan })
                          }
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                          title="Edit Plan"
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(user.id)}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
            <p className="text-sm text-zinc-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-800">User Details</h2>
              <button
                onClick={() => setViewingUser(null)}
                className="rounded-lg p-1 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-zinc-400">Name</span>
                <p className="text-sm text-zinc-800">{viewingUser.name ?? "—"}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-400">Email</span>
                <p className="text-sm text-zinc-800">{viewingUser.email}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-400">Plan</span>
                <p className="text-sm text-zinc-800">{getPlanBadge(viewingUser.plan)}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-400">Role</span>
                <p className="text-sm text-zinc-800">{viewingUser.role}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-400">Monthly Audits</span>
                <p className="text-sm text-zinc-800">{viewingUser.monthlyAuditCount}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-400">Joined</span>
                <p className="text-sm text-zinc-800">
                  {new Date(viewingUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              {viewingUser.subscriptionEndsAt && (
                <div>
                  <span className="text-xs font-medium text-zinc-400">Subscription Ends</span>
                  <p className="text-sm text-zinc-800">
                    {new Date(viewingUser.subscriptionEndsAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-800">Edit Plan</h2>
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-lg p-1 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-zinc-500">
              Changing plan for <strong>{editingPlan.user.email}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PLANS.map((plan) => (
                <button
                  key={plan}
                  onClick={() =>
                    setEditingPlan({ ...editingPlan, plan })
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    editingPlan.plan === plan
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPlan}
                disabled={
                  actionLoading || editingPlan.plan === editingPlan.user.plan
                }
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-zinc-800">
              Delete User?
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              This will permanently delete this user and all their data.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
