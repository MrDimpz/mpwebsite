import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  addInteractiveAdmin,
  addOrUpdateInteractiveStreamerUser,
  generateLiveKey,
  isValidLiveKeyFormat,
  normalizeLiveKey,
  removeInteractiveAdmin,
  removeInteractiveStreamerUser,
  useInteractiveAuthStore,
  verifyInteractiveAdminLogin,
  type InteractiveAdminAccount,
} from '../../lib/interactive-key-auth';

interface AdminPortalModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminPortalModal({ open, onClose }: AdminPortalModalProps) {
  const { admins, users } = useInteractiveAuthStore();

  // Admin Login State
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<InteractiveAdminAccount | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab inside Admin Portal
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  // Generate Key for New User State
  const [newUserHandle, setNewUserHandle] = useState('');
  const [newUserLabel, setNewUserLabel] = useState('');
  const [newUserKey, setNewUserKey] = useState(() => generateLiveKey());
  const [userFormFeedback, setUserFormFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  // Existing Users Key Visibility & Copy State
  const [revealedUserKeys, setRevealedUserKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Extra Admin State
  const [extraAdminUsername, setExtraAdminUsername] = useState('');
  const [extraAdminPassword, setExtraAdminPassword] = useState('');
  const [showExtraAdminPassword, setShowExtraAdminPassword] = useState(false);
  const [revealedAdminPasswords, setRevealedAdminPasswords] = useState<Record<string, boolean>>({});
  const [adminFormFeedback, setAdminFormFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setLoginUsername('');
      setLoginPassword('');
      setShowLoginPassword(false);
      setLoginError(null);
      setUserFormFeedback(null);
      setAdminFormFeedback(null);
      setNewUserKey(generateLiveKey());
    }
  }, [open]);

  if (!open) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = verifyInteractiveAdminLogin(loginUsername, loginPassword);
    if (!res.ok) {
      setLoginError(res.error);
      return;
    }
    setAuthenticatedAdmin(res.admin);
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleLogoutAdmin = () => {
    setAuthenticatedAdmin(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError(null);
  };

  const handleGenerateNewKeyValue = () => {
    const fresh = generateLiveKey();
    setNewUserKey(fresh);
    setUserFormFeedback(null);
  };

  const handleAddUserWithKey = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormFeedback(null);

    const formattedKey = normalizeLiveKey(newUserKey);
    if (!isValidLiveKeyFormat(formattedKey)) {
      setUserFormFeedback({
        type: 'err',
        text: 'Key must use the format LIVE-xxxx-xxxx (e.g. LIVE-8F4K-2M9P).',
      });
      return;
    }

    const res = addOrUpdateInteractiveStreamerUser({
      username: newUserHandle,
      key: formattedKey,
      label: newUserLabel,
      createdBy: authenticatedAdmin?.username || 'MPAdmin',
    });

    if (!res.ok) {
      setUserFormFeedback({ type: 'err', text: res.error });
      return;
    }

    setUserFormFeedback({
      type: 'ok',
      text: `Generated key ${res.user.key} for ${res.user.displayHandle} (active across WiKirecTangled, WikiContexto & Squared Interactive).`,
    });
    setNewUserHandle('');
    setNewUserLabel('');
    setNewUserKey(generateLiveKey());
  };

  const handleRegenerateUserKey = (username: string, label?: string) => {
    const freshKey = generateLiveKey();
    const res = addOrUpdateInteractiveStreamerUser({
      username,
      key: freshKey,
      label,
      createdBy: authenticatedAdmin?.username || 'MPAdmin',
    });
    if (res.ok) {
      setRevealedUserKeys((prev) => ({ ...prev, [res.user.id]: true }));
      setUserFormFeedback({
        type: 'ok',
        text: `Regenerated new key ${res.user.key} for ${res.user.displayHandle}.`,
      });
    }
  };

  const handleDeleteUser = (id: string, displayHandle: string) => {
    removeInteractiveStreamerUser(id);
    setUserFormFeedback({
      type: 'ok',
      text: `Removed ${displayHandle} from authorized interactive game users.`,
    });
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  const handleAddExtraAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormFeedback(null);

    const res = addInteractiveAdmin(
      extraAdminUsername,
      extraAdminPassword,
      authenticatedAdmin?.username || 'MPAdmin'
    );

    if (!res.ok) {
      setAdminFormFeedback({ type: 'err', text: res.error });
      return;
    }

    setAdminFormFeedback({
      type: 'ok',
      text: `Added admin "${res.admin.username}" with unique credentials.`,
    });
    setExtraAdminUsername('');
    setExtraAdminPassword('');
  };

  const handleRemoveExtraAdmin = (id: string, username: string) => {
    setAdminFormFeedback(null);
    const res = removeInteractiveAdmin(id);
    if (!res.ok) {
      setAdminFormFeedback({ type: 'err', text: res.error });
      return;
    }
    setAdminFormFeedback({
      type: 'ok',
      text: `Removed admin "${username}".`,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(10, 8, 6, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: authenticatedAdmin ? '780px' : '440px',
          maxHeight: '90vh',
          backgroundColor: '#12131a',
          color: '#f5f2eb',
          border: '1px solid rgba(217, 155, 38, 0.35)',
          borderRadius: '18px',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.1rem 1.4rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(217, 155, 38, 0.14), rgba(18, 19, 26, 0.95))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(217, 155, 38, 0.16)',
                border: '1px solid rgba(217, 155, 38, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f3b340',
              }}
            >
              {authenticatedAdmin ? <ShieldCheck size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#f3b340',
                }}
              >
                Interactive Games · Site Admin
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {authenticatedAdmin
                  ? 'Interactive Games Key & Admin Control Panel'
                  : 'Admin Authentication Required'}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {authenticatedAdmin && (
              <button
                type="button"
                onClick={handleLogoutAdmin}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.16)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#cbd5e1',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={13} />
                Lock
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Modal"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.14)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!authenticatedAdmin ? (
          <form
            onSubmit={handleLoginSubmit}
            autoComplete="off"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.86rem',
                lineHeight: 1.5,
                color: '#94a3b8',
              }}
            >
              Sign in with your site administrator username and password to generate{' '}
              <code style={{ color: '#f3b340', fontWeight: 700 }}>LIVE-xxxx-xxxx</code> keys for
              streamers and manage admin accounts across WiKirecTangled, WikiContexto, and Squared Interactive.
            </p>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#cbd5e1',
                  marginBottom: '0.4rem',
                }}
              >
                Admin Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  setLoginError(null);
                }}
                placeholder="Enter admin username"
                autoComplete="off"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.16)',
                  backgroundColor: '#0b0c12',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#cbd5e1',
                  marginBottom: '0.4rem',
                }}
              >
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError(null);
                  }}
                  placeholder="Enter admin password"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.6rem 0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backgroundColor: '#0b0c12',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                {loginError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.6rem',
                marginTop: '0.4rem',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f3b340, #d99b26)',
                  color: '#111218',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Unlock Admin Portal
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.4rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: '#0e1017',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '9px',
                    border:
                      activeTab === 'users'
                        ? '1px solid rgba(243, 179, 64, 0.55)'
                        : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor:
                      activeTab === 'users'
                        ? 'rgba(243, 179, 64, 0.16)'
                        : 'rgba(255,255,255,0.03)',
                    color: activeTab === 'users' ? '#f3b340' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <KeyRound size={15} />
                  User Keys & Existing Users ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admins')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '9px',
                    border:
                      activeTab === 'admins'
                        ? '1px solid rgba(56, 189, 248, 0.55)'
                        : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor:
                      activeTab === 'admins'
                        ? 'rgba(56, 189, 248, 0.16)'
                        : 'rgba(255,255,255,0.03)',
                    color: activeTab === 'admins' ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Shield size={15} />
                  Manage Admins ({admins.length})
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Signed in as{' '}
                <strong style={{ color: '#f3b340' }}>{authenticatedAdmin.username}</strong>
              </div>
            </div>

            {/* Tab Content */}
            <div
              style={{
                padding: '1.25rem 1.4rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {activeTab === 'users' ? (
                <>
                  {/* Generate Key for a New User */}
                  <form
                    onSubmit={handleAddUserWithKey}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(243, 179, 64, 0.28)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={16} color="#f3b340" />
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            color: '#f3b340',
                          }}
                        >
                          Generate Key for a New User
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        Format: <code style={{ color: '#f3b340' }}>LIVE-xxxx-xxxx</code> · Works on
                        WiKirecTangled, WikiContexto & Squared Interactive
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#94a3b8',
                            marginBottom: '0.3rem',
                          }}
                        >
                          TikTok @Username
                        </label>
                        <input
                          type="text"
                          value={newUserHandle}
                          onChange={(e) => setNewUserHandle(e.target.value)}
                          placeholder="@streamer_handle"
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backgroundColor: '#0b0c12',
                            color: '#ffffff',
                            fontSize: '0.86rem',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#94a3b8',
                            marginBottom: '0.3rem',
                          }}
                        >
                          Access Key (LIVE-xxxx-xxxx)
                        </label>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            type="text"
                            value={newUserKey}
                            onChange={(e) => setNewUserKey(e.target.value.toUpperCase())}
                            placeholder="LIVE-XXXX-XXXX"
                            style={{
                              flex: 1,
                              padding: '0.6rem 0.75rem',
                              borderRadius: '9px',
                              border: '1px solid rgba(243, 179, 64, 0.45)',
                              backgroundColor: '#0b0c12',
                              color: '#f3b340',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.86rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleGenerateNewKeyValue}
                            title="Generate random LIVE-xxxx-xxxx key"
                            style={{
                              padding: '0 0.7rem',
                              borderRadius: '9px',
                              border: '1px solid rgba(243, 179, 64, 0.4)',
                              backgroundColor: 'rgba(243, 179, 64, 0.12)',
                              color: '#f3b340',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <RefreshCw size={15} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#94a3b8',
                            marginBottom: '0.3rem',
                          }}
                        >
                          Label / Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={newUserLabel}
                          onChange={(e) => setNewUserLabel(e.target.value)}
                          placeholder="e.g. Creator Live Host"
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backgroundColor: '#0b0c12',
                            color: '#ffffff',
                            fontSize: '0.86rem',
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.6rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleGenerateNewKeyValue}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          color: '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={13} />
                        Roll New LIVE-xxxx-xxxx Key
                      </button>

                      <button
                        type="submit"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '9px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #f3b340, #d99b26)',
                          color: '#111218',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={15} />
                        Generate & Save User Key
                      </button>
                    </div>
                  </form>

                  {userFormFeedback && (
                    <div
                      style={{
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        backgroundColor:
                          userFormFeedback.type === 'ok'
                            ? 'rgba(16, 185, 129, 0.14)'
                            : 'rgba(239, 68, 68, 0.14)',
                        border:
                          userFormFeedback.type === 'ok'
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : '1px solid rgba(239, 68, 68, 0.4)',
                        color: userFormFeedback.type === 'ok' ? '#6ee7b7' : '#fca5a5',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      {userFormFeedback.text}
                    </div>
                  )}

                  {/* Existing Users List */}
                  <div
                    style={{
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.85rem 1.1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} color="#38bdf8" />
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            color: '#e2e8f0',
                          }}
                        >
                          Existing Authorized Users ({users.length})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Valid across WiKirecTangled, WikiContexto & Squared Interactive
                      </span>
                    </div>

                    {users.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '0.85rem',
                        }}
                      >
                        No users registered yet. Generate a key above to authorize a user.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {users.map((u) => {
                          const isShown = !!revealedUserKeys[u.id];
                          const isCopied = copiedId === u.id;
                          return (
                            <div
                              key={u.id}
                              style={{
                                padding: '0.85rem 1.1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.75rem',
                              }}
                            >
                              <div style={{ minWidth: '180px' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '0.95rem',
                                      fontWeight: 800,
                                      color: '#ffffff',
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {u.displayHandle}
                                  </span>
                                  {u.label && (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(255,255,255,0.06)',
                                        color: '#cbd5e1',
                                      }}
                                    >
                                      {u.label}
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.7rem',
                                    color: '#64748b',
                                    marginTop: '0.15rem',
                                  }}
                                >
                                  Added by {u.createdBy || 'Admin'}
                                </div>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <code
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '7px',
                                    backgroundColor: '#090a0f',
                                    border: '1px solid rgba(243, 179, 64, 0.35)',
                                    color: '#f3b340',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                  }}
                                >
                                  {isShown ? u.key : 'LIVE-••••-••••'}
                                </code>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedUserKeys((prev) => ({
                                      ...prev,
                                      [u.id]: !prev[u.id],
                                    }))
                                  }
                                  title={isShown ? 'Hide key' : 'Show key'}
                                  style={{
                                    padding: '0.4rem',
                                    borderRadius: '7px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {isShown ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyText(u.id, u.key)}
                                  title="Copy LIVE-xxxx-xxxx key"
                                  style={{
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '7px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backgroundColor: isCopied
                                      ? 'rgba(16, 185, 129, 0.2)'
                                      : 'rgba(255,255,255,0.04)',
                                    color: isCopied ? '#6ee7b7' : '#cbd5e1',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                >
                                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                  {isCopied ? 'Copied' : 'Copy'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRegenerateUserKey(u.username, u.label)}
                                  title="Generate a new LIVE-xxxx-xxxx key for this user"
                                  style={{
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '7px',
                                    border: '1px solid rgba(243, 179, 64, 0.3)',
                                    backgroundColor: 'rgba(243, 179, 64, 0.1)',
                                    color: '#f3b340',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                >
                                  <RefreshCw size={12} />
                                  New Key
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.displayHandle)}
                                  title="Remove user"
                                  style={{
                                    padding: '0.4rem',
                                    borderRadius: '7px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#fca5a5',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Add Extra Admin Form */}
                  <form
                    onSubmit={handleAddExtraAdmin}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} color="#38bdf8" />
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: '#38bdf8',
                        }}
                      >
                        Add Extra Admin Account
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#94a3b8',
                            marginBottom: '0.3rem',
                          }}
                        >
                          Unique Admin Username
                        </label>
                        <input
                          type="text"
                          value={extraAdminUsername}
                          onChange={(e) => setExtraAdminUsername(e.target.value)}
                          placeholder="e.g. CoAdminAlex"
                          autoComplete="off"
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backgroundColor: '#0b0c12',
                            color: '#ffffff',
                            fontSize: '0.86rem',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#94a3b8',
                            marginBottom: '0.3rem',
                          }}
                        >
                          Admin Password
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showExtraAdminPassword ? 'text' : 'password'}
                            value={extraAdminPassword}
                            onChange={(e) => setExtraAdminPassword(e.target.value)}
                            placeholder="Set password"
                            autoComplete="new-password"
                            style={{
                              width: '100%',
                              padding: '0.6rem 2.4rem 0.6rem 0.75rem',
                              borderRadius: '9px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              backgroundColor: '#0b0c12',
                              color: '#ffffff',
                              fontSize: '0.86rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowExtraAdminPassword((v) => !v)}
                            style={{
                              position: 'absolute',
                              right: '0.5rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                            }}
                          >
                            {showExtraAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '9px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                          color: '#090d16',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={15} />
                        Add Extra Admin
                      </button>
                    </div>
                  </form>

                  {adminFormFeedback && (
                    <div
                      style={{
                        padding: '0.7rem 0.95rem',
                        borderRadius: '10px',
                        backgroundColor:
                          adminFormFeedback.type === 'ok'
                            ? 'rgba(16, 185, 129, 0.14)'
                            : 'rgba(239, 68, 68, 0.14)',
                        border:
                          adminFormFeedback.type === 'ok'
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : '1px solid rgba(239, 68, 68, 0.4)',
                        color: adminFormFeedback.type === 'ok' ? '#6ee7b7' : '#fca5a5',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      {adminFormFeedback.text}
                    </div>
                  )}

                  {/* Existing Admins List */}
                  <div
                    style={{
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.85rem 1.1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: '#e2e8f0',
                        }}
                      >
                        Authorized Admin Accounts ({admins.length})
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {admins.map((adm) => {
                        const showPass = !!revealedAdminPasswords[adm.id];
                        return (
                          <div
                            key={adm.id}
                            style={{
                              padding: '0.85rem 1.1rem',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 800,
                                    color: '#ffffff',
                                  }}
                                >
                                  {adm.username}
                                </span>
                                {adm.isDefault ? (
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(243, 179, 64, 0.18)',
                                      color: '#f3b340',
                                    }}
                                  >
                                    DEFAULT ADMIN
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                      color: '#38bdf8',
                                    }}
                                  >
                                    EXTRA ADMIN
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#64748b',
                                  marginTop: '0.15rem',
                                }}
                              >
                                Created by {adm.createdBy || 'System'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <code
                                style={{
                                  padding: '0.32rem 0.6rem',
                                  borderRadius: '7px',
                                  backgroundColor: '#090a0f',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  color: '#cbd5e1',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {showPass ? adm.password : '••••••••••'}
                              </code>

                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedAdminPasswords((prev) => ({
                                    ...prev,
                                    [adm.id]: !prev[adm.id],
                                  }))
                                }
                                style={{
                                  padding: '0.4rem',
                                  borderRadius: '7px',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  backgroundColor: 'rgba(255,255,255,0.04)',
                                  color: '#cbd5e1',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>

                              {!adm.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExtraAdmin(adm.id, adm.username)}
                                  title="Remove extra admin"
                                  style={{
                                    padding: '0.4rem',
                                    borderRadius: '7px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#fca5a5',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
