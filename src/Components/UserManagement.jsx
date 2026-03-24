import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Btn, Card } from './UI';

const ROLES = ['ADMIN', 'SUPERVISOR', 'TELLER'];

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', username: '', password: '', role: 'TELLER' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.username || (!editingId && !form.password)) {
      alert('Please fill in all required fields.'); return;
    }
    if (user.role === 'SUPERVISOR' && form.role !== 'TELLER') {
      alert('Supervisors can only create Teller accounts.'); return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
      } else {
        await api.post('/users', form);
      }
      fetchUsers();
      setForm({ fullName: '', username: '', password: '', role: 'TELLER' });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      alert('Failed to save user.');
    }
    setLoading(false);
  };

  const handleEdit = (u) => {
    setForm({ fullName: u.fullName, username: u.username, password: '', role: u.role });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u.id}`, { ...u, active: !u.active });
    fetchUsers();
  };

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', background: '#f7faf7' }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {ROLES.map(role => (
          <div key={role} style={{ background: '#fff', border: '1px solid #e8f0e9', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>{role === 'ADMIN' ? '👑' : role === 'SUPERVISOR' ? '👔' : '💳'}</div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7c6e', fontWeight: 600, textTransform: 'uppercase' }}>{role}S</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0d1f0e' }}>{users.filter(u => u.role === role).length}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a202c' }}>Staff Accounts</div>
        <Btn variant="primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ fullName: '', username: '', password: '', role: 'TELLER' }); }}>
          + {showForm && !editingId ? 'Cancel' : 'Add Staff'}
        </Btn>
      </div>

      {/* Form */}
      {showForm && (
        <Card title={editingId ? 'Edit Staff Account' : 'Add New Staff Account'} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Full Name *</label>
              <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="e.g. John Smith"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Username *</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="e.g. jsmith"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Password {editingId ? '(leave blank to keep)' : '*'}</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Role *</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff' }}>
                {user.role === 'SUPERVISOR' ? (
                  <option value="TELLER">TELLER</option>
                ) : (
                  ROLES.map(r => <option key={r} value={r}>{r}</option>)
                )}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <Btn variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Staff' : 'Create Account'}
            </Btn>
            <Btn onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8f0e9' }}>
                {['ID', 'Full Name', 'Username', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#6b7c6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f5f0' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7faf7'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '11px' }}>{u.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a202c' }}>{u.fullName}</td>
                  <td style={{ padding: '10px 12px', color: '#4a5568' }}>@{u.username}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: u.role === 'ADMIN' ? '#fff5f5' : u.role === 'SUPERVISOR' ? '#fffbeb' : '#f0fff4',
                      color: u.role === 'ADMIN' ? '#c53030' : u.role === 'SUPERVISOR' ? '#975a16' : '#276749',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: u.active ? '#f0fff4' : '#fff5f5',
                      color: u.active ? '#276749' : '#c53030',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    }}>{u.active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleEdit(u)} style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1px solid #d1d5db', background: '#f9fafb', color: '#4a5568' }}>Edit</button>
                      <button onClick={() => toggleActive(u)} style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${u.active ? '#f6ad55' : '#68d391'}`, background: u.active ? '#fffbeb' : '#f0fff4', color: u.active ? '#975a16' : '#276749' }}>
                        {u.active ? 'Disable' : 'Enable'}
                      </button>
                      {user.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(u.id)} style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1px solid #fc8181', background: '#fff5f5', color: '#c53030' }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}