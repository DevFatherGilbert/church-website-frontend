"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Crown,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  UserX,
} from "lucide-react";
import { authGet, authMutation, type ManagedUser } from "@/lib/api/church-api";
import { useConfirmation } from "@/components/admin/confirmation-dialog";

type CurrentProfile = {
  id?: string;
  email?: string;
  role?: string;
  fullName?: string;
};

export function UserRoleManager() {
  const confirm = useConfirmation();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [usersResponse, meResponse] = await Promise.all([
        authGet<{ items?: ManagedUser[] } | ManagedUser[]>("/admin/users"),
        authGet<CurrentProfile>("/auth/me").catch(() => null),
      ]);
      const list = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse.items ?? [];
      setUsers(list);
      if (meResponse) setCurrentUser(meResponse);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load church users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !q ||
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.phone && user.phone.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const members = users.filter((u) => u.role === "member").length;
    const active = users.filter((u) => u.status === "active").length;
    return { total, admins, members, active };
  }, [users]);

  async function handleToggleRole(targetUser: ManagedUser) {
    const isPromoting = targetUser.role !== "admin";
    const newRole = isPromoting ? "admin" : "member";

    const confirmed = await confirm({
      title: isPromoting
        ? `Grant Administrator access to ${targetUser.fullName}?`
        : `Remove Administrator access from ${targetUser.fullName}?`,
      description: isPromoting
        ? `“${targetUser.fullName}” (${targetUser.email}) will have full administrator permissions to manage sermons, events, website content, and portal settings.`
        : `“${targetUser.fullName}” will no longer have access to the administrator portal. They will become a standard member.`,
      confirmLabel: isPromoting ? "Make Administrator" : "Demote to Member",
      tone: isPromoting ? "primary" : "danger",
    });

    if (!confirmed) return;

    setUpdatingId(targetUser.id);
    setError("");
    setNotice("");

    try {
      await authMutation(`/admin/users/${targetUser.id}/role`, "PATCH", {
        role: newRole,
      });

      setNotice(
        isPromoting
          ? `Successfully granted administrator access to ${targetUser.fullName}.`
          : `Removed administrator access from ${targetUser.fullName}.`,
      );
      await loadData();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to update user role.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleStatus(targetUser: ManagedUser) {
    const isDisabling = targetUser.status === "active";
    const newStatus = isDisabling ? "disabled" : "active";

    const confirmed = await confirm({
      title: isDisabling
        ? `Disable account for ${targetUser.fullName}?`
        : `Activate account for ${targetUser.fullName}?`,
      description: isDisabling
        ? `“${targetUser.fullName}” will be blocked from signing in to the website and portal.`
        : `“${targetUser.fullName}” will be permitted to sign in to the website.`,
      confirmLabel: isDisabling ? "Disable Account" : "Activate Account",
      tone: isDisabling ? "danger" : "primary",
    });

    if (!confirmed) return;

    setUpdatingId(targetUser.id);
    setError("");
    setNotice("");

    try {
      await authMutation(`/admin/users/${targetUser.id}/status`, "PATCH", {
        status: newStatus,
      });

      setNotice(
        isDisabling
          ? `Account for ${targetUser.fullName} has been disabled.`
          : `Account for ${targetUser.fullName} has been activated.`,
      );
      await loadData();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to update account status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteUser(targetUser: ManagedUser) {
    const confirmed = await confirm({
      title: `Delete account for ${targetUser.fullName}?`,
      description: `“${targetUser.fullName}” (${targetUser.email}) will be permanently deleted from the database. This action cannot be undone.`,
      confirmLabel: "Delete User",
      tone: "danger",
    });

    if (!confirmed) return;

    setUpdatingId(targetUser.id);
    setError("");
    setNotice("");

    try {
      await authMutation(`/admin/users/${targetUser.id}`, "DELETE");
      setNotice(
        `User account for ${targetUser.fullName} has been permanently deleted.`,
      );
      await loadData();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to delete user account.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Church · Access Control
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Users & Roles Management
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Manage church member accounts and designate trusted leaders as administrators.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-xs font-bold text-foreground shadow-xs transition hover:bg-surface-strong"
          onClick={() => {
            setLoading(true);
            void loadData();
          }}
          type="button"
        >
          <RefreshCw
            aria-hidden="true"
            className={`mr-2 size-3.5 ${loading ? "animate-spin text-primary" : ""}`}
          />
          Refresh List
        </button>
      </header>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          role="alert"
        >
          <AlertTriangle className="size-5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
          role="status"
        >
          <Check className="size-5 shrink-0 text-emerald-600" />
          <p>{notice}</p>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Users
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Administrators
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Crown className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {stats.admins}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Standard Members
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {stats.members}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Active Accounts
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {stats.active}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <section
        aria-label="Users and access management"
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs"
      >
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or phone…"
              type="search"
              value={query}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              Role
              <select
                className="h-11 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setRoleFilter(e.target.value)}
                value={roleFilter}
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="member">Members</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              Status
              <select
                className="h-11 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setStatusFilter(e.target.value)}
                value={statusFilter}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          </div>
        </div>

        {/* User Listing */}
        {loading ? (
          <div className="p-12 text-center text-sm text-muted">
            <RefreshCw className="mx-auto mb-3 size-6 animate-spin text-primary" />
            Loading accounts…
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto size-10 text-muted" />
            <h3 className="mt-3 font-display text-base font-bold text-foreground">
              {query ? "No matching accounts" : "No registered users found"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {query
                ? "Try searching for a different name or email address."
                : "When church members sign up, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => {
              const isSelf =
                currentUser?.id === user.id ||
                currentUser?.email?.toLowerCase() === user.email.toLowerCase();
              const isUpdating = updatingId === user.id;

              return (
                <article
                  className="flex flex-col gap-4 p-5 transition hover:bg-surface-strong/40 sm:flex-row sm:items-center sm:justify-between"
                  key={user.id}
                >
                  <div className="flex items-start gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-base font-bold text-primary">
                      {user.avatar ? (
                        <img
                          alt={user.fullName}
                          className="size-full rounded-2xl object-cover"
                          src={user.avatar}
                        />
                      ) : (
                        user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-foreground">
                          {user.fullName}
                        </h3>

                        {isSelf && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                            You
                          </span>
                        )}

                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Crown className="size-3" /> Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Member
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : user.status === "pending"
                                ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3.5" /> {user.email}
                        </span>
                        {user.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3.5" /> {user.phone}
                          </span>
                        )}
                        {user.createdAt && (
                          <span>
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {user.role === "admin" ? (
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3.5 text-xs font-bold text-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        disabled={isSelf || isUpdating}
                        onClick={() => void handleToggleRole(user)}
                        title={
                          isSelf
                            ? "You cannot remove your own administrator access"
                            : "Demote to Member"
                        }
                        type="button"
                      >
                        <UserMinus className="mr-1.5 size-3.5" />
                        Revoke Admin
                      </button>
                    ) : (
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40"
                        disabled={isUpdating}
                        onClick={() => void handleToggleRole(user)}
                        type="button"
                      >
                        <ShieldCheck className="mr-1.5 size-4" />
                        Make Administrator
                      </button>
                    )}

                    {user.status === "active" ? (
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 text-xs font-bold text-muted transition hover:bg-surface-strong hover:text-foreground disabled:opacity-40"
                        disabled={isSelf || isUpdating}
                        onClick={() => void handleToggleStatus(user)}
                        title={
                          isSelf
                            ? "You cannot disable your own account"
                            : "Disable account"
                        }
                        type="button"
                      >
                        <UserX className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                        disabled={isUpdating}
                        onClick={() => void handleToggleStatus(user)}
                        title="Activate account"
                        type="button"
                      >
                        <UserCheck className="size-3.5" />
                      </button>
                    )}

                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 text-xs font-bold text-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                      disabled={isSelf || isUpdating}
                      onClick={() => void handleDeleteUser(user)}
                      title={
                        isSelf
                          ? "You cannot delete your own account"
                          : "Permanently delete user"
                      }
                      type="button"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
