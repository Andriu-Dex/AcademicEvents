import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ChevronDown, Search } from "lucide-react";
import adminService from "../../services/adminService";
import Validator from "../../utils/Validator";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";
import "./styles/AdminGestion.css";

/**
 * Vista para la gestión de administradores
 * Solo visible para usuarios con rol ADMIN_GLOBAL
 */
const AdminGestion = () => {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    celular: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    rol: "ADMIN_GENERAL",
  });

  // Estado para filtros
  const [filtros, setFiltros] = useState({
    search: "",
    rol: "",
  });
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isListSectionOpen, setIsListSectionOpen] = useState(true);

  // Hook de paginación para administradores
  const {
    data: administradores,
    loading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination("/admin/list-admins-paginados", 15);

  const [formErrors, setFormErrors] = useState({});

  // Cargar la lista de administradores al montar el componente y cuando cambien los filtros
  useEffect(() => {
    const cargarAdministradores = async () => {
      try {
        await fetchData(filtros);
      } catch (error) {
        console.error("Error al cargar administradores:", error);
        toast.error("No se pudieron cargar los administradores");
      }
    };

    cargarAdministradores();
  }, [fetchData, filtros]);

  /**
   * Maneja cambios en los filtros
   * @param {Object} e - Evento del input
   */
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  /**
   * Aplica los filtros y resetea la paginación
   */
  const aplicarFiltros = (e) => {
    e.preventDefault();
    goToPage(1); // Volver a la primera página al aplicar filtros
    fetchData(filtros);
  };

  /**
   * Limpia todos los filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      search: "",
      rol: "",
    });
    goToPage(1);
  };

  /**
   * Maneja cambios en los campos del formulario
   */
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

  /**
   * Valida el formulario antes de enviar
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */ const validarFormulario = () => {
    const errors = {};

    // Validar cédula
    // if (!Validator.validarCedulaEcuatoriana(formData.cedula)) {
    //   errors.cedula = "La cédula es inválida";
    // }

    // Validar nombres
    if (!formData.nombres || !Validator.soloLetras(formData.nombres)) {
      errors.nombres = "Ingrese un nombre válido (solo letras)";
    }

    // Validar apellidos
    if (!formData.apellidos || !Validator.soloLetras(formData.apellidos)) {
      errors.apellidos = "Ingrese apellidos válidos (solo letras)";
    }

    // Validar celular
    if (!Validator.validarCelularEcuatoriano(formData.celular)) {
      errors.celular =
        "El número de celular debe empezar con 09 y tener 10 dígitos";
    }

    // Validar correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = "Ingrese un correo electrónico válido";
    }

    // Validar contraseña
    // if (formData.contrasena.length < 8) {
    //   errors.contrasena = "La contraseña debe tener al menos 8 caracteres";
    // }

    // Validar confirmación de contraseña
    if (formData.contrasena !== formData.confirmarContrasena) {
      errors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }

    try {
      setLoading(true);

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

      // Limpiar formulario
      setFormData({
        cedula: "",
        nombres: "",
        apellidos: "",
        celular: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        rol: "ADMIN_GENERAL",
      });

      // Recargar lista de administradores
      await fetchData(filtros);
    } catch (error) {
      console.error("Error al crear administrador:", error);

      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("No se pudo crear el administrador");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-admin-gestion-ag mx-auto">
      <h1 className="titulo-principal-ag">Gestión de Administradores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de creación */}
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
                  <p className="text-xs text-gray-500 mt-1">
                    * Los Super Administradores pueden crear otros administradores
                  </p>
                </div>
                <div className="boton-container-ag mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="boton-crear-ag"
                  >
                    {loading ? "Creando..." : "Crear Administrador"}
                  </button>
                </div>{" "}
              </form>
            </div>
          )}
        </div>
        {/* Lista de administradores */}
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

          {/* Filtros para buscar administradores */}
          <div className="filtros-container-ag mb-4">
            <form
              onSubmit={aplicarFiltros}
              className="flex flex-col sm:flex-row gap-2 mb-3"
            >
              <div className="search-box-ag">
                <input
                  type="text"
                  name="search"
                  value={filtros.search}
                  onChange={handleFiltroChange}
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
                  value={filtros.rol}
                  onChange={handleFiltroChange}
                  className="select-filter-ag"
                >
                  <option value="">Todos los roles</option>
                  <option value="ADMIN_GENERAL">Admin General</option>
                  <option value="ADMIN_GLOBAL">Super Admin</option>
                </select>

                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="btn-filter-clear-ag"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          {loading ? (
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
                          {admin.rol_usu === "ADMIN_GLOBAL"
                            ? "Super Admin"
                            : "Admin General"}
                        </span>
                      </td>
                      <td className="celdas-tabla-ag">
                        <span
                          className={`badge-role-ag ${
                            admin.est_ver_cor
                              ? "badge-verified-ag"
                              : "badge-pending-ag"
                          }`}
                        >
                          {admin.est_ver_cor ? "Verificado" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Controles de paginación */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                loading={loading}
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
      </div>
    </div>
  );
};

export default AdminGestion;
