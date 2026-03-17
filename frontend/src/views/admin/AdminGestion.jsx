import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ChevronDown,
  Eye,
  Pencil,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import adminService from "../../services/adminService";
import Validator from "../../utils/Validator";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";
import ActionConfirmModal from "../../components/common/ActionConfirmModal";
import "./styles/AdminGestion.css";

/**
 * Vista para la gestión de administradores
 * Solo visible para usuarios con rol ADMIN_GLOBAL
 */
const AdminGestion = () => {
  const EMPTY_ADMIN_FORM = {
    cedula: "",
    nombres: "",
    apellidos: "",
    celular: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    rol: "ADMIN_GENERAL",
  };

  const EMPTY_EDIT_FORM = {
    cedula: "",
    nombres: "",
    apellidos: "",
    celular: "",
    correo: "",
    rol: "",
    est_ver_cor: false,
  };

  const [formData, setFormData] = useState({
    ...EMPTY_ADMIN_FORM,
  });
  const [formErrors, setFormErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const [adminFilters, setAdminFilters] = useState({
    search: "",
    rol: "",
  });

  const [userFilters, setUserFilters] = useState({
    search: "",
    rol: "",
  });

  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isListSectionOpen, setIsListSectionOpen] = useState(false);
  const [isUsersSectionOpen, setIsUsersSectionOpen] = useState(false);

  const [modalMode, setModalMode] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT_FORM });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountActionModal, setAccountActionModal] = useState(null);
  const [accountActionTargetId, setAccountActionTargetId] = useState(null);
  const [isSubmittingAccountAction, setIsSubmittingAccountAction] =
    useState(false);

  const {
    data: administradores,
    loading: adminsLoading,
    currentPage: adminsCurrentPage,
    totalPages: adminsTotalPages,
    totalItems: adminsTotalItems,
    itemsPerPage: adminsItemsPerPage,
    fetchData: fetchAdmins,
    goToPage: goToAdminsPage,
    hasNextPage: adminsHasNextPage,
    hasPrevPage: adminsHasPrevPage,
  } = usePagination("/admin/list-admins-paginados", 15);

  const {
    data: usuarios,
    loading: usersLoading,
    currentPage: usersCurrentPage,
    totalPages: usersTotalPages,
    totalItems: usersTotalItems,
    itemsPerPage: usersItemsPerPage,
    fetchData: fetchUsers,
    goToPage: goToUsersPage,
    hasNextPage: usersHasNextPage,
    hasPrevPage: usersHasPrevPage,
  } = usePagination("/admin/list-users-paginados", 15);

  useEffect(() => {
    const cargarAdministradores = async () => {
      try {
        await fetchAdmins(adminFilters);
      } catch (error) {
        console.error("Error al cargar administradores:", error);
        toast.error("No se pudieron cargar los administradores");
      }
    };

    cargarAdministradores();
  }, [fetchAdmins, adminFilters]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        await fetchUsers(userFilters);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast.error("No se pudieron cargar los usuarios");
      }
    };

    cargarUsuarios();
  }, [fetchUsers, userFilters]);

  const normalizeErrorMessage = (error, fallbackMessage) => {
    return (
      error?.response?.data?.error ||
      error?.response?.data?.msg ||
      error?.response?.data?.mensaje ||
      error?.message ||
      fallbackMessage
    );
  };

  const handleAdminFilterChange = (e) => {
    const { name, value } = e.target;
    setAdminFilters({
      ...adminFilters,
      [name]: value,
    });
  };

  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilters({
      ...userFilters,
      [name]: value,
    });
  };

  const aplicarFiltrosAdmins = (e) => {
    e.preventDefault();
    goToAdminsPage(1);
    fetchAdmins(adminFilters);
  };

  const aplicarFiltrosUsuarios = (e) => {
    e.preventDefault();
    goToUsersPage(1);
    fetchUsers(userFilters);
  };

  const limpiarFiltrosAdmins = () => {
    const cleanFilters = {
      search: "",
      rol: "",
    };
    setAdminFilters(cleanFilters);
    goToAdminsPage(1);
    fetchAdmins(cleanFilters);
  };

  const limpiarFiltrosUsuarios = () => {
    const cleanFilters = {
      search: "",
      rol: "",
    };
    setUserFilters(cleanFilters);
    goToUsersPage(1);
    fetchUsers(cleanFilters);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error específico cuando el usuario modifica un campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.nombres || !Validator.soloLetras(formData.nombres)) {
      errors.nombres = "Ingrese un nombre válido (solo letras)";
    }

    if (!formData.apellidos || !Validator.soloLetras(formData.apellidos)) {
      errors.apellidos = "Ingrese apellidos válidos (solo letras)";
    }

    if (!Validator.validarCelularEcuatoriano(formData.celular)) {
      errors.celular =
        "El número de celular debe empezar con 09 y tener 10 dígitos";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = "Ingrese un correo electrónico válido";
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      errors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }

    try {
      setCreateLoading(true);

      const adminData = {
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol: formData.rol,
      };

      await adminService.crearAdmin(adminData);
      toast.success("Administrador creado exitosamente");

      setFormData({
        ...EMPTY_ADMIN_FORM,
      });

      await fetchAdmins(adminFilters);
    } catch (error) {
      const message = normalizeErrorMessage(
        error,
        "No se pudo crear el administrador"
      );
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const mapAccountToEditForm = (account) => ({
    cedula: account?.usuario?.ced_usu || "",
    nombres: account?.usuario?.nom_usu || "",
    apellidos: account?.usuario?.ape_usu || "",
    celular: account?.usuario?.cel_usu || "",
    correo: account?.cor_usu || "",
    rol: account?.rol_usu || "",
    est_ver_cor: Boolean(account?.est_ver_cor),
  });

  const openViewModal = (account, kind) => {
    setSelectedAccount({ ...account, __kind: kind });
    setModalMode("view");
  };

  const openEditModal = (account, kind) => {
    setSelectedAccount({ ...account, __kind: kind });
    setEditForm(mapAccountToEditForm(account));
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAccount(null);
    setEditForm({ ...EMPTY_EDIT_FORM });
  };

  const refreshLists = async () => {
    await Promise.all([fetchAdmins(adminFilters), fetchUsers(userFilters)]);
  };

  const handleEditFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAccount = async () => {
    if (!selectedAccount?.id_cue) return;

    try {
      setIsSavingAccount(true);

      await adminService.actualizarCuenta(
        selectedAccount.id_cue,
        {
          cedula: editForm.cedula,
          nombres: editForm.nombres,
          apellidos: editForm.apellidos,
          celular: editForm.celular,
          correo: editForm.correo,
          rol: editForm.rol,
          est_ver_cor: editForm.est_ver_cor,
        }
      );

      toast.success("Cuenta actualizada correctamente");
      closeModal();
      await refreshLists();
    } catch (error) {
      const message = normalizeErrorMessage(
        error,
        "No se pudo actualizar la cuenta"
      );
      toast.error(message);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const getAccountDisplayName = (account) => {
    const firstName = account?.usuario?.nom_usu || "";
    const lastName = account?.usuario?.ape_usu || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || account?.cor_usu || "la cuenta seleccionada";
  };

  const closeAccountActionModal = () => {
    if (isSubmittingAccountAction) return;
    setAccountActionModal(null);
  };

  const openDeleteActionModal = (account) => {
    const displayName = getAccountDisplayName(account);

    setAccountActionModal({
      type: "delete",
      account,
      title: "Confirmar eliminación de cuenta",
      description: `Esta acción eliminará la cuenta de ${displayName} si no tiene dependencias históricas.`,
      confirmText: "Eliminar cuenta",
      confirmVariant: "danger",
      requireReason: false,
      successMessage: "Cuenta eliminada correctamente",
      errorFallback: "No se pudo eliminar la cuenta",
    });
  };

  const openBlockActionModal = (account) => {
    const displayName = getAccountDisplayName(account);

    setAccountActionModal({
      type: "block",
      account,
      title: "Bloquear cuenta",
      description: `Se bloqueará la cuenta de ${displayName} y se invalidarán sus sesiones activas.`,
      confirmText: "Bloquear cuenta",
      confirmVariant: "warning",
      requireReason: true,
      reasonLabel: "Motivo de bloqueo",
      reasonPlaceholder: "Ejemplo: Incumplimiento de políticas institucionales",
      successMessage: "Cuenta bloqueada correctamente",
      errorFallback: "No se pudo bloquear la cuenta",
    });
  };

  const openUnblockActionModal = (account) => {
    const displayName = getAccountDisplayName(account);

    setAccountActionModal({
      type: "unblock",
      account,
      title: "Desbloquear cuenta",
      description: `Se habilitará nuevamente la cuenta de ${displayName}.`,
      confirmText: "Desbloquear cuenta",
      confirmVariant: "success",
      requireReason: true,
      reasonLabel: "Motivo de desbloqueo",
      reasonPlaceholder: "Ejemplo: Caso revisado y aprobado",
      successMessage: "Cuenta desbloqueada correctamente",
      errorFallback: "No se pudo desbloquear la cuenta",
    });
  };

  const handleConfirmAccountAction = async (reason) => {
    if (!accountActionModal?.account?.id_cue) return;

    const accountId = accountActionModal.account.id_cue;

    try {
      setIsSubmittingAccountAction(true);
      setAccountActionTargetId(accountId);

      if (accountActionModal.type === "delete") {
        await adminService.eliminarCuenta(accountId);
      }

      if (accountActionModal.type === "block") {
        await adminService.bloquearCuenta(accountId, reason);
      }

      if (accountActionModal.type === "unblock") {
        await adminService.desbloquearCuenta(accountId, reason);
      }

      toast.success(accountActionModal.successMessage);
      setAccountActionModal(null);
      await refreshLists();
    } catch (error) {
      const message = normalizeErrorMessage(
        error,
        accountActionModal.errorFallback
      );
      toast.error(message);
    } finally {
      setIsSubmittingAccountAction(false);
      setAccountActionTargetId(null);
    }
  };

  const renderStatus = (account) => {
    if (account?.est_bloqueado) {
      return <span className="badge-role-ag badge-blocked-ag">Bloqueado</span>;
    }

    return (
      <span
        className={`badge-role-ag ${
          account?.est_ver_cor ? "badge-verified-ag" : "badge-pending-ag"
        }`}
      >
        {account?.est_ver_cor ? "Verificado" : "Pendiente"}
      </span>
    );
  };

  const renderActions = (account, kind) => {
    const isProcessingAction = accountActionTargetId === account.id_cue;
    const isBlocked = Boolean(account?.est_bloqueado);

    return (
      <div className="acciones-cuenta-ag">
        <button
          type="button"
          className="btn-accion-ag"
          onClick={() => openViewModal(account, kind)}
          title="Ver detalle"
        >
          <Eye size={16} strokeWidth={2.2} className="action-icon-ag" />
        </button>
        <button
          type="button"
          className="btn-accion-ag"
          onClick={() => openEditModal(account, kind)}
          disabled={isProcessingAction}
          title="Editar"
        >
          <Pencil size={16} strokeWidth={2.2} className="action-icon-ag" />
        </button>
        <button
          type="button"
          className={`btn-accion-ag ${
            isBlocked ? "btn-accion-success-ag" : "btn-accion-warning-ag"
          }`}
          disabled={isProcessingAction}
          onClick={() =>
            isBlocked
              ? openUnblockActionModal(account)
              : openBlockActionModal(account)
          }
          title={isBlocked ? "Desbloquear" : "Bloquear"}
        >
          {isBlocked ? (
            <UserCheck size={16} strokeWidth={2.2} className="action-icon-ag" />
          ) : (
            <UserX size={16} strokeWidth={2.2} className="action-icon-ag" />
          )}
        </button>
        <button
          type="button"
          className="btn-accion-ag btn-accion-danger-ag"
          disabled={isProcessingAction}
          onClick={() => openDeleteActionModal(account)}
          title="Eliminar"
        >
          <Trash2 size={16} strokeWidth={2.2} className="action-icon-ag" />
        </button>
      </div>
    );
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN_GLOBAL: "Super Admin",
      ADMIN_GENERAL: "Admin General",
      ESTUDIANTE: "Estudiante",
      GENERAL: "General",
    };

    return labels[role] || role;
  };

  const modalRoleOptions = selectedAccount?.__kind === "admin"
    ? [
        { value: "ADMIN_GENERAL", label: "Admin General" },
        { value: "ADMIN_GLOBAL", label: "Super Admin" },
      ]
    : [
        { value: "ESTUDIANTE", label: "Estudiante" },
        { value: "GENERAL", label: "General" },
      ];

  return (
    <div className="container-admin-gestion-ag mx-auto">
      <h1 className="titulo-principal-ag">Gestión de Administradores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="formulario-section-ag">
          <button
            type="button"
            className="accordion-header-ag"
            onClick={() => setIsCreateSectionOpen((prev) => !prev)}
            aria-expanded={isCreateSectionOpen}
            aria-controls="crear-admin-accordion-panel"
          >
            <h2 className="subtitulo-ag subtitulo-acordeon-ag">
              Crear Nuevo Administrador
            </h2>
            <ChevronDown
              size={22}
              className={`accordion-icon-ag ${
                isCreateSectionOpen ? "accordion-icon-open-ag" : ""
              }`}
            />
          </button>

          {isCreateSectionOpen && (
            <div
              id="crear-admin-accordion-panel"
              className="accordion-body-ag"
            >
              <form
                onSubmit={handleSubmit}
                className="form-crear-admin-ag space-y-4"
              >
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Cédula
                  </label>{" "}
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.cedula ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ingrese la cédula"
                    maxLength="10"
                  />
                  {formErrors.cedula && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.cedula}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Nombres
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.nombres ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ingrese los nombres"
                  />
                  {formErrors.nombres && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.nombres}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.apellidos ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ingrese los apellidos"
                  />
                  {formErrors.apellidos && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.apellidos}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Celular
                  </label>{" "}
                  <input
                    type="text"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.celular ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ingrese el número de celular"
                    maxLength="10"
                  />
                  {formErrors.celular && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.celular}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.correo ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ingrese el correo electrónico"
                  />
                  {formErrors.correo && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.correo}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.contrasena ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ingrese la contraseña"
                  />
                  {formErrors.contrasena && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.contrasena}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    className={`input-ag w-full p-2 border rounded-md ${
                      formErrors.confirmarContrasena
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirme la contraseña"
                  />
                  {formErrors.confirmarContrasena && (
                    <p className="error-message-ag text-red-500 text-xs mt-1">
                      {formErrors.confirmarContrasena}
                    </p>
                  )}
                </div>
                <div className="campo-form-ag">
                  <label className="label-ag block text-sm font-medium text-gray-700">
                    Rol de Administrador
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="select-ag w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="ADMIN_GENERAL">Administrador General</option>
                    <option value="ADMIN_GLOBAL">Super Administrador</option>
                  </select>
                </div>
                <div className="boton-container-ag mt-6">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="boton-crear-ag"
                  >
                    {createLoading ? "Creando..." : "Crear Administrador"}
                  </button>
                </div>{" "}
              </form>
            </div>
          )}
        </div>
        <div className="space-y-8">
          <div className="lista-section-ag">
            <button
              type="button"
              className="accordion-header-ag"
              onClick={() => setIsListSectionOpen((prev) => !prev)}
              aria-expanded={isListSectionOpen}
              aria-controls="lista-admin-accordion-panel"
            >
              <h2 className="subtitulo-ag subtitulo-acordeon-ag">
                Administradores Existentes
              </h2>
              <ChevronDown
                size={22}
                className={`accordion-icon-ag ${
                  isListSectionOpen ? "accordion-icon-open-ag" : ""
                }`}
              />
            </button>

            {isListSectionOpen && (
              <div
                id="lista-admin-accordion-panel"
                className="accordion-body-ag"
              >
                <div className="filtros-container-ag mb-4">
                  <form
                    onSubmit={aplicarFiltrosAdmins}
                    className="flex flex-col sm:flex-row gap-2 mb-3"
                  >
                    <div className="search-box-ag">
                      <input
                        type="text"
                        name="search"
                        value={adminFilters.search}
                        onChange={handleAdminFilterChange}
                        placeholder="Buscar por nombre, cédula o correo"
                        className="search-input-ag"
                      />
                      <Search
                        size={18}
                        className="search-icon-ag absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>

                    <div className="filter-controls-ag">
                      <select
                        name="rol"
                        value={adminFilters.rol}
                        onChange={handleAdminFilterChange}
                        className="select-filter-ag"
                      >
                        <option value="">Todos los roles</option>
                        <option value="ADMIN_GENERAL">Admin General</option>
                        <option value="ADMIN_GLOBAL">Super Admin</option>
                      </select>

                      <button
                        type="button"
                        onClick={limpiarFiltrosAdmins}
                        className="btn-filter-clear-ag"
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>
                </div>

                {adminsLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="spinner-ag"></div>
                  </div>
                ) : administradores && administradores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="tabla-admins-ag min-w-full divide-y divide-gray-200">
                      <thead className="thead-ag bg-gray-50">
                        <tr>
                          <th className="th-ag px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="th-ag px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Correo
                          </th>
                          <th className="th-ag px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="th-ag px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="th-ag px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="tbody-ag bg-white divide-y divide-gray-200">
                        {administradores.map((admin) => (
                          <tr key={admin.id_cue} className="tr-ag hover:bg-gray-50">
                            <td className="celdas-tabla-ag">
                              <div className="text-sm font-medium text-gray-900">
                                {admin.usuario.nom_usu} {admin.usuario.ape_usu}
                              </div>
                              <div className="text-sm text-gray-500">
                                {admin.usuario.ced_usu}
                              </div>
                            </td>
                            <td className="celdas-tabla-ag">
                              <div className="text-sm text-gray-900">
                                {admin.cor_usu}
                              </div>
                            </td>
                            <td className="celdas-tabla-ag">
                              <span
                                className={`badge-role-ag ${
                                  admin.rol_usu === "ADMIN_GLOBAL"
                                    ? "badge-role-superadmin-ag"
                                    : "badge-role-admin-ag"
                                }`}
                              >
                                {getRoleLabel(admin.rol_usu)}
                              </span>
                            </td>
                            <td className="celdas-tabla-ag">
                              {renderStatus(admin)}
                            </td>
                            <td className="celdas-tabla-ag">
                              {renderActions(admin, "admin")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <PaginationControls
                      currentPage={adminsCurrentPage}
                      totalPages={adminsTotalPages}
                      onPageChange={goToAdminsPage}
                      hasNextPage={adminsHasNextPage}
                      hasPrevPage={adminsHasPrevPage}
                      totalItems={adminsTotalItems}
                      itemsPerPage={adminsItemsPerPage}
                      loading={adminsLoading}
                      className="variant-admin"
                      showInfo={true}
                    />
                  </div>
                ) : (
                  <div className="estado-vacio-ag text-center p-8 text-gray-500">
                    No hay administradores registrados
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lista-section-ag">
            <button
              type="button"
              className="accordion-header-ag"
              onClick={() => setIsUsersSectionOpen((prev) => !prev)}
              aria-expanded={isUsersSectionOpen}
              aria-controls="lista-usuarios-accordion-panel"
            >
              <h2 className="subtitulo-ag subtitulo-acordeon-ag">
                Usuarios Existentes
              </h2>
              <ChevronDown
                size={22}
                className={`accordion-icon-ag ${
                  isUsersSectionOpen ? "accordion-icon-open-ag" : ""
                }`}
              />
            </button>

            {isUsersSectionOpen && (
              <div
                id="lista-usuarios-accordion-panel"
                className="accordion-body-ag"
              >
                <div className="filtros-container-ag mb-4">
                  <form
                    onSubmit={aplicarFiltrosUsuarios}
                    className="flex flex-col sm:flex-row gap-2 mb-3"
                  >
                    <div className="search-box-ag">
                      <input
                        type="text"
                        name="search"
                        value={userFilters.search}
                        onChange={handleUserFilterChange}
                        placeholder="Buscar por nombre, cédula o correo"
                        className="search-input-ag"
                      />
                      <Search
                        size={18}
                        className="search-icon-ag absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>

                    <div className="filter-controls-ag">
                      <select
                        name="rol"
                        value={userFilters.rol}
                        onChange={handleUserFilterChange}
                        className="select-filter-ag"
                      >
                        <option value="">Todos los roles</option>
                        <option value="ESTUDIANTE">Estudiante</option>
                        <option value="GENERAL">General</option>
                      </select>

                      <button
                        type="button"
                        onClick={limpiarFiltrosUsuarios}
                        className="btn-filter-clear-ag"
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>
                </div>

                {usersLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="spinner-ag"></div>
                  </div>
                ) : usuarios && usuarios.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="tabla-admins-ag min-w-full divide-y divide-gray-200">
                      <thead className="thead-ag bg-gray-50">
                        <tr>
                          <th className="th-ag">Nombre</th>
                          <th className="th-ag">Correo</th>
                          <th className="th-ag">Rol</th>
                          <th className="th-ag">Estado</th>
                          <th className="th-ag">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="tbody-ag bg-white divide-y divide-gray-200">
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id_cue} className="tr-ag hover:bg-gray-50">
                            <td className="celdas-tabla-ag">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.usuario.nom_usu} {usuario.usuario.ape_usu}
                              </div>
                              <div className="text-sm text-gray-500">
                                {usuario.usuario.ced_usu}
                              </div>
                            </td>
                            <td className="celdas-tabla-ag">
                              <div className="text-sm text-gray-900">
                                {usuario.cor_usu}
                              </div>
                            </td>
                            <td className="celdas-tabla-ag">
                              <span className="badge-role-ag badge-role-admin-ag">
                                {getRoleLabel(usuario.rol_usu)}
                              </span>
                            </td>
                            <td className="celdas-tabla-ag">
                              {renderStatus(usuario)}
                            </td>
                            <td className="celdas-tabla-ag">
                              {renderActions(usuario, "user")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <PaginationControls
                      currentPage={usersCurrentPage}
                      totalPages={usersTotalPages}
                      onPageChange={goToUsersPage}
                      hasNextPage={usersHasNextPage}
                      hasPrevPage={usersHasPrevPage}
                      totalItems={usersTotalItems}
                      itemsPerPage={usersItemsPerPage}
                      loading={usersLoading}
                      className="variant-admin"
                      showInfo={true}
                    />
                  </div>
                ) : (
                  <div className="estado-vacio-ag text-center p-8 text-gray-500">
                    No hay usuarios registrados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalMode && selectedAccount && (
        <div className="modal-overlay-ag" onClick={closeModal}>
          <div
            className="modal-content-ag"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header-ag">
              <h3>
                {modalMode === "view" ? "Detalle de cuenta" : "Editar cuenta"}
              </h3>
              <button type="button" className="modal-close-ag" onClick={closeModal}>
                x
              </button>
            </div>

            <div className="modal-body-ag">
              {modalMode === "view" ? (
                <div className="modal-view-grid-ag">
                  <div>
                    <strong>Nombre:</strong> {selectedAccount.usuario?.nom_usu} {" "}
                    {selectedAccount.usuario?.ape_usu}
                  </div>
                  <div>
                    <strong>Cédula:</strong> {selectedAccount.usuario?.ced_usu}
                  </div>
                  <div>
                    <strong>Correo:</strong> {selectedAccount.cor_usu}
                  </div>
                  <div>
                    <strong>Rol:</strong> {getRoleLabel(selectedAccount.rol_usu)}
                  </div>
                  <div>
                    <strong>Estado:</strong>{" "}
                    {selectedAccount.est_ver_cor ? "Verificado" : "Pendiente"}
                  </div>
                  <div>
                    <strong>Bloqueo:</strong>{" "}
                    {selectedAccount.est_bloqueado ? "Bloqueado" : "No"}
                  </div>
                  {selectedAccount.est_bloqueado && (
                    <>
                      <div>
                        <strong>Motivo bloqueo:</strong>{" "}
                        {selectedAccount.razon_bloqueo || "No especificado"}
                      </div>
                      <div>
                        <strong>Fecha bloqueo:</strong>{" "}
                        {selectedAccount.fec_bloqueo
                          ? new Date(selectedAccount.fec_bloqueo).toLocaleString()
                          : "No disponible"}
                      </div>
                    </>
                  )}
                  <div>
                    <strong>Celular:</strong> {selectedAccount.usuario?.cel_usu}
                  </div>
                </div>
              ) : (
                <div className="modal-edit-form-ag">
                  <div className="campo-form-ag">
                    <label className="label-ag">Cédula</label>
                    <input
                      className="input-ag"
                      name="cedula"
                      value={editForm.cedula}
                      onChange={handleEditFieldChange}
                    />
                  </div>

                  <div className="campo-form-ag">
                    <label className="label-ag">Nombres</label>
                    <input
                      className="input-ag"
                      name="nombres"
                      value={editForm.nombres}
                      onChange={handleEditFieldChange}
                    />
                  </div>

                  <div className="campo-form-ag">
                    <label className="label-ag">Apellidos</label>
                    <input
                      className="input-ag"
                      name="apellidos"
                      value={editForm.apellidos}
                      onChange={handleEditFieldChange}
                    />
                  </div>

                  <div className="campo-form-ag">
                    <label className="label-ag">Celular</label>
                    <input
                      className="input-ag"
                      name="celular"
                      value={editForm.celular}
                      onChange={handleEditFieldChange}
                    />
                  </div>

                  <div className="campo-form-ag">
                    <label className="label-ag">Correo</label>
                    <input
                      className="input-ag"
                      name="correo"
                      value={editForm.correo}
                      onChange={handleEditFieldChange}
                    />
                  </div>

                  <div className="campo-form-ag">
                    <label className="label-ag">Rol</label>
                    <select
                      className="select-ag"
                      name="rol"
                      value={editForm.rol}
                      onChange={handleEditFieldChange}
                    >
                      {modalRoleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="check-verified-ag">
                    <input
                      type="checkbox"
                      name="est_ver_cor"
                      checked={editForm.est_ver_cor}
                      onChange={handleEditFieldChange}
                    />
                    Correo verificado
                  </label>
                </div>
              )}
            </div>

            <div className="modal-actions-ag">
              <button type="button" className="btn-modal-secondary-ag" onClick={closeModal}>
                Cerrar
              </button>

              {modalMode === "edit" && (
                <button
                  type="button"
                  className="btn-modal-primary-ag"
                  onClick={handleSaveAccount}
                  disabled={isSavingAccount}
                >
                  {isSavingAccount ? "Guardando..." : "Guardar cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ActionConfirmModal
        isOpen={Boolean(accountActionModal)}
        title={accountActionModal?.title}
        description={accountActionModal?.description}
        confirmText={accountActionModal?.confirmText}
        confirmVariant={accountActionModal?.confirmVariant}
        requireReason={Boolean(accountActionModal?.requireReason)}
        reasonLabel={accountActionModal?.reasonLabel}
        reasonPlaceholder={accountActionModal?.reasonPlaceholder}
        minReasonLength={8}
        isSubmitting={isSubmittingAccountAction}
        onClose={closeAccountActionModal}
        onConfirm={handleConfirmAccountAction}
      />
    </div>
  );
};

export default AdminGestion;
