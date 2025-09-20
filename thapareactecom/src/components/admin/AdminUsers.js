import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useAdmin } from "../../context/AdminContext";

const AdminUsers = () => {
  const { 
    users, 
    loading, 
    error, 
    fetchUsers, 
    updateUserRole, 
    deleteUser, 
    clearError 
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState({});
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear errors after a timeout
  useEffect(() => {
    if (error.users) {
      const timer = setTimeout(() => {
        clearError('users');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error.users, clearError]);

  // Toast notification system
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleColor = (role) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return '#ff6b35';
      case 'USER':
        return '#4299e1';
      default:
        return '#718096';
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      setActionLoading(prev => ({ ...prev, [`delete_${userId}`]: true }));
      
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          showToast(result.message, 'success');
        } else {
          showToast(result.message, 'error');
        }
      } catch (error) {
        showToast("Error deleting user", 'error');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete_${userId}`]: false }));
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole, userName) => {
    const actionKey = `role_${userId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        showToast(`${userName}'s role updated to ${newRole}`, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast("Error updating user role", 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  return (
    <UsersWrapper>
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="header-content">
          <h2>User Management</h2>
          <p>Manage all registered users and their accounts</p>
        </div>
        
        {/* Refresh Button */}
        <button 
          className={`refresh-btn ${loading.users ? 'loading' : ''}`}
          onClick={fetchUsers}
          disabled={loading.users}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {loading.users ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error.users && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Failed to load users: {error.users}</span>
            <button onClick={() => clearError('users')} className="error-close">×</button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading.users ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="no-users">
            <div className="no-users-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Users Found</h3>
            <p>No users match your current search criteria.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user.id} className={`user-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                    <td className="avatar-cell">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={`${user.name}'s avatar`}
                            onError={(e) => {
                              // If image fails to load, show letter avatar
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="letter-avatar" style={{ display: user.avatar ? 'none' : 'flex' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="name-cell">
                      <div className="user-name">{user.name}</div>
                    </td>
                    <td className="email-cell">
                      <div className="user-email">{user.email}</div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ 
                        color: getRoleColor(user.role),
                        backgroundColor: `${getRoleColor(user.role)}15`
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <select
                          className={`role-select ${actionLoading[`role_${user.id}`] ? 'loading' : ''}`}
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value, user.name)}
                          disabled={actionLoading[`role_${user.id}`]}
                          title="Change Role"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        {user.role !== 'ADMIN' && (
                          <button 
                            className={`action-btn delete ${actionLoading[`delete_${user.id}`] ? 'loading' : ''}`}
                            title="Delete User"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={actionLoading[`delete_${user.id}`]}
                          >
                            {actionLoading[`delete_${user.id}`] ? (
                              <div className="spinner-small"></div>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`page-number ${currentPage === number ? 'active' : ''}`}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}
    </UsersWrapper>
  );
};

export default AdminUsers;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInTop = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-50px) translateX(50%);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) translateX(50%);
  }
`;

const UsersWrapper = styled.div`
  /* Toast Notifications */
  .toast-container {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .toast {
    background: white;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 320px;
    animation: ${slideInTop} 0.4s ease-out;
    border-left: 4px solid;

    &.toast-success {
      border-left-color: #48bb78;
      
      .toast-icon {
        color: #48bb78;
      }
    }

    &.toast-error {
      border-left-color: #f56565;
      
      .toast-icon {
        color: #f56565;
      }
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      color: #2d3748;
      font-weight: 500;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: #718096;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #2d3748;
      }
    }
  }

  .section-header {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    padding: 2.25rem;
    border-radius: 18px;
    margin-bottom: 2rem;
    box-shadow: 0 10px 36px rgba(0, 0, 0, 0.12);
    animation: ${fadeIn} 0.6s ease-out;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;

    .header-content {
      flex: 1;
      min-width: 260px;
    }

    h2 {
      color: #2d3748;
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    p {
      color: #4a5568;
      font-size: 1.05rem;
      margin: 0;
      line-height: 1.6;
    }

    .refresh-btn {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
      border: none;
      padding: 0.9rem 1.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.25s ease;
      box-shadow: 0 6px 18px rgba(66, 153, 225, 0.28);
      flex-shrink: 0;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(66, 153, 225, 0.35);
        background: linear-gradient(135deg, #3182ce, #2c5282);
      }

      &:disabled {
        opacity: 0.8;
        cursor: not-allowed;
        transform: none;
      }

      &.loading svg {
        animation: ${spin} 1s linear infinite;
      }
    }
  }

  /* Error Banner */
  .error-banner {
    background: rgba(245, 101, 101, 0.1);
    border: 1px solid rgba(245, 101, 101, 0.25);
    border-radius: 14px;
    margin-bottom: 2rem;
    animation: ${slideIn} 0.3s ease-out;

    .error-content {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #c53030;
      font-size: 1rem;

      svg {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      span {
        flex: 1;
        font-weight: 600;
        line-height: 1.5;
      }

      .error-close {
        background: none;
        border: none;
        color: #c53030;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0.25rem;
        border-radius: 8px;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(245, 101, 101, 0.12);
        }
      }
    }
  }

  .filters-section {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    padding: 1.75rem;
    border-radius: 14px;
    margin-bottom: 2rem;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
    align-items: center;
    animation: ${fadeIn} 0.6s ease-out 0.1s both;

    .search-box {
      flex: 1;
      position: relative;
      min-width: 260px;

      .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #718096;
        z-index: 1;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      input {
        width: 100%;
        padding: 14px 16px 14px 52px;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1.05rem;
        background: #fff;
        transition: all 0.25s ease;
        line-height: 1.4;

        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.12);
        }
      }
    }

    .filter-select {
      select {
        padding: 14px 18px;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1.05rem;
        background: white;
        cursor: pointer;
        transition: all 0.25s ease;

        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.12);
        }
      }
    }
  }

  .users-table-container {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-radius: 18px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    animation: ${fadeIn} 0.6s ease-out 0.2s both;
    margin-bottom: 2rem;

    .loading-container {
      padding: 4.5rem 2rem;
      text-align: center;

      .loading-spinner {
        width: 46px;
        height: 46px;
        border: 5px solid #e2e8f0;
        border-top: 5px solid #4299e1;
        border-radius: 50%;
        animation: ${spin} 1s linear infinite;
        margin: 0 auto 1rem auto;
      }

      p {
        color: #4a5568;
        font-size: 1.05rem;
      }
    }

    .no-users {
      padding: 4.5rem 2rem;
      text-align: center;

      .no-users-icon {
        color: #cbd5e0;
        margin-bottom: 1.5rem;

        svg {
          width: 64px;
          height: 64px;
        }
      }

      h3 {
        color: #2d3748;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }

      p {
        color: #4a5568;
        font-size: 1.05rem;
      }
    }

    .table-wrapper {
      overflow-x: auto;

      .users-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: auto;

        thead {
          background: rgba(66, 153, 225, 0.12);

          th {
            padding: 1.75rem 1.5rem;
            text-align: left;
            font-weight: 700;
            color: #2d3748;
            font-size: 1.1rem;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            border-bottom: 1px solid #e2e8f0;
            white-space: nowrap;

            &:first-child {
              text-align: center;
              width: 100px;
            }
          }
        }

        tbody {
          .user-row {
            transition: background 0.25s ease;

            &:hover {
              background: rgba(66, 153, 225, 0.06);
            }

            &.even {
              background: rgba(247, 250, 252, 0.7);
            }

            td {
              padding: 1.75rem 1.5rem;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: middle;
              font-size: 1.1rem;
            }

            .avatar-cell {
              text-align: center;
              width: 100px;

              .user-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                margin: 0 auto;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(66, 153, 225, 0.2);
                border: 3px solid #ffffff;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 50%;
                }

                .letter-avatar {
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(135deg, #4299e1, #3182ce);
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  font-size: 1.4rem;
                  border-radius: 50%;
                }
              }
            }

            .name-cell {
              min-width: 180px;

              .user-name {
                font-weight: 700;
                color: #2d3748;
                font-size: 1.2rem;
                line-height: 1.3;
                margin-bottom: 0;
              }
            }

            .email-cell {
              min-width: 220px;

              .user-email {
                color: #4a5568;
                font-size: 1.05rem;
                line-height: 1.4;
                word-break: break-word;
                margin: 0;
              }
            }

            .role-badge {
              display: inline-block;
              padding: 0.6rem 1.2rem;
              border-radius: 9999px;
              font-size: 1rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              border: 2px solid currentColor;
              min-width: 80px;
              text-align: center;
            }

            .actions-cell {
              min-width: 200px;

              .action-buttons {
                display: flex;
                gap: 1rem;
                align-items: center;

                .role-select {
                  padding: 0.75rem 1rem;
                  border: 2px solid #e2e8f0;
                  border-radius: 10px;
                  font-size: 1rem;
                  background: white;
                  cursor: pointer;
                  transition: all 0.25s ease;
                  font-weight: 600;
                  min-width: 100px;

                  &:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.12);
                  }

                  &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                  }

                  &.loading {
                    background: rgba(66, 153, 225, 0.1);
                  }
                }

                .action-btn {
                  width: 48px;
                  height: 48px;
                  border: none;
                  border-radius: 12px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.25s ease;

                  svg {
                    width: 20px;
                    height: 20px;
                  }

                  &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                  }

                  .spinner-small {
                    width: 18px;
                    height: 18px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: ${spin} 0.9s linear infinite;
                  }

                  &.delete {
                    background: rgba(245, 101, 101, 0.12);
                    color: #f56565;

                    &:hover:not(:disabled) {
                      background: rgba(245, 101, 101, 0.22);
                      transform: translateY(-1px) scale(1.05);
                      box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 14px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
    animation: ${fadeIn} 0.6s ease-out 0.3s both;

    .pagination-btn {
      background: #4299e1;
      color: white;
      border: none;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      font-size: 1rem;
      transition: all 0.25s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        background: #3182ce;
        transform: translateY(-1px);
      }

      &:disabled {
        background: #cbd5e0;
        color: #f7fafc;
        cursor: not-allowed;
        transform: none;
      }
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;

      .page-number {
        width: 44px;
        height: 44px;
        border: 2px solid #e2e8f0;
        background: white;
        color: #2d3748;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.25s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #4299e1;
          color: #4299e1;
        }

        &.active {
          background: #4299e1;
          color: white;
          border-color: #4299e1;
        }
      }
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    margin-bottom: 120px; /* Space for mobile sidebar */

    .toast-container {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      
      .toast {
        min-width: unset;
        width: 100%;
      }
    }

    .section-header {
      padding: 1.75rem;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;

      .header-content h2 {
        font-size: 2rem;
      }

      .header-content p {
        font-size: 1rem;
      }

      .refresh-btn {
        align-self: flex-end;
        font-size: 0.95rem;
        padding: 0.85rem 1.25rem;
      }
    }

    .filters-section {
      padding: 1.25rem;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;

      .search-box,
      .filter-select {
        width: 100%;
      }

      .search-box input {
        font-size: 1rem;
        padding: 12px 14px 12px 48px;
      }

      .filter-select select {
        font-size: 1rem;
        padding: 12px 14px;
      }
    }

    .users-table-container .table-wrapper {
      .users-table {
        font-size: 1rem;

        thead th {
          padding: 1.5rem 1rem;
          font-size: 1rem;
        }

        tbody .user-row td {
          padding: 1.5rem 1rem;
        }

        .avatar-cell {
          width: 90px;

          .user-avatar {
            width: 52px;
            height: 52px;

            .letter-avatar {
              font-size: 1.2rem;
            }
          }
        }

        .name-cell {
          min-width: 160px;

          .user-name {
            font-size: 1.1rem;
          }
        }

        .email-cell {
          min-width: 200px;

          .user-email {
            font-size: 1rem;
          }
        }

        .actions-cell {
          min-width: 180px;

          .action-buttons {
            gap: 0.8rem;

            .role-select {
              font-size: 0.95rem;
              padding: 0.6rem 0.8rem;
              min-width: 90px;
            }

            .action-btn {
              width: 44px;
              height: 44px;

              svg {
                width: 18px;
                height: 18px;
              }
            }
          }
        }
      }
    }

    .pagination {
      padding: 1.25rem;
      
      .pagination-btn {
        font-size: 0.95rem;
        padding: 0.75rem 1.1rem;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .page-number {
        width: 40px;
        height: 40px;
        font-size: 0.95rem;
      }
    }
  }

  @media (max-width: 480px) {
    .users-table-container .table-wrapper {
      .users-table {
        thead th {
          padding: 1rem 0.75rem;
          font-size: 0.9rem;
        }

        tbody .user-row td {
          padding: 1rem 0.75rem;
        }

        .avatar-cell {
          width: 70px;

          .user-avatar {
            width: 44px;
            height: 44px;

            .letter-avatar {
              font-size: 1rem;
            }
          }
        }

        .name-cell {
          min-width: 140px;

          .user-name {
            font-size: 1rem;
          }
        }

        .email-cell {
          min-width: 180px;

          .user-email {
            font-size: 0.9rem;
          }
        }

        .role-badge {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          min-width: 70px;
        }

        .actions-cell {
          min-width: 160px;

          .action-buttons {
            flex-direction: column;
            gap: 0.6rem;

            .role-select {
              width: 100%;
              font-size: 0.85rem;
              padding: 0.5rem 0.7rem;
              min-width: unset;
            }

            .action-btn {
              width: 40px;
              height: 40px;
              align-self: center;

              svg {
                width: 16px;
                height: 16px;
              }
            }
          }
        }
      }
    }
  }
`;