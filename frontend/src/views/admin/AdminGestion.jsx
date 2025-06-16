import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import adminService from "../../services/adminService";
import Validator from "../../utils/Validator";
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

  // Estado para la lista de administradores
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Cargar la lista de administradores al montar el componente
  useEffect(() => {
    cargarAdministradores();
  }, []);

  /**
   * Carga la lista de administradores desde el servidor
   */
  const cargarAdministradores = async () => {
    try {
      setLoading(true);
      const data = await adminService.obtenerAdmins();
      setAdministradores(data);
    } catch (error) {
      console.error("Error al cargar administradores:", error);
      toast.error("No se pudieron cargar los administradores");
    } finally {
      setLoading(false);
    }
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
    // if (!Validator.validarCelularEcuatoriano(formData.celular)) {
    //   errors.celular = "Ingrese un número de celular válido (10 dígitos)";
    // }

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
      cargarAdministradores();
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
        {" "}
        {/* Formulario de creación */}
        <div className="formulario-section-ag">
          <h2 className="subtitulo-ag">Crear Nuevo Administrador</h2>

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
        {/* Lista de administradores */}
        <div className="lista-section-ag">
          <h2 className="subtitulo-ag">Administradores Existentes</h2>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="spinner-ag"></div>
            </div>
          ) : administradores.length > 0 ? (
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
                        </div>{" "}
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
            </div>
          ) : (
            <div className="estado-vacio-ag text-center p-8 text-gray-500">
              No hay administradores registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGestion;
