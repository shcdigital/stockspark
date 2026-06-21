import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';
import { Users, UserPlus, Shield, UserCheck, UserX, Key } from 'lucide-react';

// Logo del negocio - placeholder URL (debe reemplazarse con el logo real)
const BUSINESS_LOGO = 'https://placehold.co/48x48/f0fdfa/14b8a6?text=LOGO';

export const UserManagement: React.FC = () => {
  const { users, saveUser, deleteUser, resetUserMFA, config } = useStock();
  const { currentUser, isAdmin } = useAuth();

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rol: 'Operador' as UserRole,
    activo: true,
    mfaHabilitado: false
  });

  if (!isAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-neutral-200 text-center space-y-4 shadow-sm">
        <Shield className="h-12 w-12 text-secondary-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-neutral-900">Acceso Denegado: Exclusivo Administradores</h2>
        <p className="text-neutral-600 text-sm max-w-md mx-auto">
          Su cuenta actual tiene rol de <strong>Operador</strong>. Las Reglas de Seguridad de Firestore impiden el acceso a la colección de gestión de usuarios.
        </p>
      </div>
    );
  }

  const openNewUserModal = () => {
    if (users.length >= 10) {
      alert('Se ha alcanzado el límite de 10 usuarios concurrentes especificado en la arquitectura del Plan Spark.');
      return;
    }
    setEditingUser(null);
    setForm({ nombre: '', email: '', rol: 'Operador', activo: true, mfaHabilitado: false });
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: UserProfile) => {
    setEditingUser(user);
    setForm({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
      mfaHabilitado: user.mfaHabilitado
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) return;

    const userObj: UserProfile = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      nombre: form.nombre,
      email: form.email,
      rol: form.rol,
      activo: form.activo,
      mfaHabilitado: form.mfaHabilitado,
      mfaSecret: editingUser?.mfaSecret
    };

    saveUser(userObj);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Administración de Usuarios y Roles (Max 10)</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Gestión de acceso de empleados, Allowlist de Firestore Rules y control 2FA TOTP.
          </p>
        </div>
        <button
          onClick={openNewUserModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Empleado</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-5 bg-primary-50/50 border border-primary-200 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-primary-700 flex items-center space-x-2">
          <Key className="h-4 w-4" />
          <span>Funcionamiento de la Allowlist y 2FA en Firestore Rules</span>
        </h3>
        <p className="text-xs text-neutral-700 leading-relaxed">
          Los correos electrónicos que gestione aquí se guardan automáticamente en el documento <code className="bg-white px-1.5 py-0.5 rounded text-primary-700">config/system</code>. Las reglas de Firestore realizan una comprobación doble: verifican que el email pertenezca a la Allowlist y que en <code className="bg-white px-1.5 py-0.5 rounded text-primary-700">usuarios/$(request.auth.uid)</code> exista el rol necesario antes de procesar cualquier transacción.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary-200">
          <span className="text-xs font-bold text-neutral-600">Allowlist Activa:</span>
          {config.allowedEmails.map((email, idx) => (
            <span key={idx} className="bg-white border border-primary-200 text-primary-700 text-xs px-2.5 py-1 rounded-lg font-mono">
              {email}
            </span>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 bg-primary-50/30 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-neutral-900 font-bold text-base">
            <Users className="h-5 w-5 text-primary-600" />
            <span>Cuentas Registradas en el Sistema ({users.length} / 10)</span>
          </div>
          <span className="text-xs bg-white text-neutral-600 px-3 py-1 rounded-full border border-neutral-200">
            {10 - users.length} cupos restantes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary-50/30 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4">Empleado / Nombre</th>
                <th className="py-3 px-4">Correo (Firebase Auth)</th>
                <th className="py-3 px-4">Rol del Usuario</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">2FA TOTP</th>
                <th className="py-3 px-4 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm text-neutral-700">
              {users.map((usr) => {
                const isSelf = currentUser?.id === usr.id;
                return (
                  <tr key={usr.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-neutral-900 flex items-center gap-2">
                        <span>{usr.nombre}</span>
                        {isSelf && <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-semibold">Tú</span>}
                      </p>
                      <span className="text-xs text-neutral-500 font-mono">{usr.id}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-neutral-600">
                      {usr.email}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        usr.rol === 'Admin' ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {usr.rol}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        usr.activo ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-secondary-100 text-secondary-700 border border-secondary-200'
                      }`}>
                        {usr.activo ? <UserCheck className="h-3 w-3 mr-1 text-emerald-600" /> : <UserX className="h-3 w-3 mr-1 text-secondary-600" />}
                        <span>{usr.activo ? 'Activo' : 'Inactivo'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        usr.mfaHabilitado ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {usr.mfaHabilitado ? 'Habilitado' : 'Pendiente Enrolar'}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                      {usr.mfaHabilitado && (
                        <button
                          onClick={() => { if (confirm(`¿Resetear el 2FA de ${usr.nombre}?`)) resetUserMFA(usr.id); }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                          title="Desvincular 2FA TOTP para volver a enrolar con QR"
                        >
                          Resetear 2FA
                        </button>
                      )}
                      <button
                        onClick={() => openEditUserModal(usr)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Editar
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => { if (confirm(`¿Eliminar al usuario ${usr.nombre}?`)) deleteUser(usr.id); }}
                          className="px-2.5 py-1 bg-secondary-50 hover:bg-secondary-100 text-secondary-600 border border-secondary-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 mb-2">
              <img src={BUSINESS_LOGO} alt="Logo" className="h-8 w-8 rounded-lg border border-primary-200" />
              <h3 className="text-lg font-bold text-neutral-900">
                {editingUser ? 'Editar Perfil de Empleado' : 'Registrar Empleado Nuevo'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Marcos Silva (Almacén)"
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Correo Electrónico (Allowlist) *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ejemplo@negocio.com"
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Rol en el Sistema *</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value as UserRole })}
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 text-sm focus:outline-none focus:border-primary-400"
                >
                  <option value="Operador">Operador (Solo Movimientos y Consultas)</option>
                  <option value="Admin">Admin (Control Total y Gestión Usuarios)</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-primary-50/30 p-4 rounded-xl border border-primary-200">
                <div>
                  <span className="text-sm font-bold text-neutral-900 block">Cuenta Activa</span>
                  <span className="text-xs text-neutral-600 block">Permite o prohíbe el inicio de sesión</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="h-5 w-5 rounded border-neutral-300 bg-white text-primary-600 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};