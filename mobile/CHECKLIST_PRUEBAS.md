# Checklist de pruebas - Mobile

Lista completa de validación para la app móvil de AcademicEvents.

## Autenticación y sesión

- [ ] El login funciona con credenciales válidas.
- [ ] El login rechaza credenciales inválidas con mensaje claro.
- [ ] La sesion persiste al cerrar y reabrir la app.
- [ ] El logout limpia el estado local.
- [ ] El registro, si esta habilitado, valida campos obligatorios.
- [ ] El flujo de olvido/restablecimiento de contraseña funciona.
- [ ] Las rutas protegidas no abren sin sesion.

## Inicio y navegación

- [ ] La pantalla inicial carga sin pantallas en blanco.
- [ ] La navegación inferior o lateral responde correctamente.
- [ ] Los titulos de pantalla son correctos.
- [ ] Los estados de carga se ven antes de la data.
- [ ] Los estados vacios muestran un mensaje util.
- [ ] Los estados de error permiten reintentar.

## Eventos publicos

- [ ] El listado de eventos carga correctamente.
- [ ] El detalle de evento muestra nombre, fecha y descripcion.
- [ ] Las imagenes de portada cargan sin romper el layout.
- [ ] Los filtros o busquedas de eventos funcionan.
- [ ] La paginacion o carga incremental no duplica eventos.
- [ ] Los eventos cerrados o inactivos se muestran con su estado correcto.

## Inscripciones

- [ ] Un estudiante puede inscribirse a un evento disponible.
- [ ] La app valida la carta de motivacion antes de enviar.
- [ ] La app valida el comprobante cuando el evento lo requiere.
- [ ] No se permiten inscripciones duplicadas en el mismo evento.
- [ ] Los cupos disponibles se actualizan correctamente.
- [ ] El estado de la inscripción cambia según la respuesta del backend.
- [ ] Los errores de inscripcion se muestran con mensaje entendible.
- [ ] La tarjeta de inscripcion muestra la fecha de registro.

## Mis inscripciones

- [ ] El listado de "Mis Inscripciones" carga correctamente.
- [ ] Los filtros por estado funcionan.
- [ ] El conteo de filtros coincide con la data real.
- [ ] La tarjeta muestra el estado actual sin ambiguedades.
- [ ] La tarjeta muestra el comprobante de pago cuando existe.
- [ ] El boton de descargar certificado aparece solo cuando corresponde.
- [ ] El boton de enviar certificado por correo aparece solo cuando corresponde.
- [ ] El boton "Ver detalles" abre el detalle compacto.
- [ ] El detalle muestra Tipo.
- [ ] El detalle muestra Fecha.
- [ ] El detalle muestra Observación del administrador.
- [ ] Si no hay observacion, la UI muestra un texto de respaldo.
- [ ] Si la inscripción está finalizada, se muestran asistencia y nota final.
- [ ] Las acciones se deshabilitan o se ocultan segun el estado final.
- [ ] Las calificaciones no aparecen vacias cuando el backend ya envio valores.

## Certificados

- [ ] La descarga de certificado abre el archivo correcto.
- [ ] Si el certificado no existe, la app lo solicita al backend.
- [ ] El envio por correo lanza una confirmacion antes de ejecutar la accion.
- [ ] El envio por correo muestra exito cuando el backend responde bien.
- [ ] El envio por correo muestra error cuando falla el backend o el SMTP.
- [ ] El certificado abierto respeta el formato PDF o la URL publica.

## Notificaciones y tiempo real

- [ ] Las notificaciones push se registran en el dispositivo.
- [ ] La app recibe notificaciones cuando el backend las envia.
- [ ] Los cambios de inscripcion por socket se reflejan sin recargar manualmente.
- [ ] Los cambios de evento por socket se reflejan en la app.
- [ ] La app no duplica notificaciones por reconexion.
- [ ] La sesion de realtime se reconecta despues de perder red.

## Perfil y datos del usuario

- [ ] El perfil del estudiante carga correctamente.
- [ ] La edicion de datos personales guarda cambios.
- [ ] La foto de perfil puede actualizarse.
- [ ] Los errores de validacion del perfil se muestran con claridad.
- [ ] La app mantiene los datos visibles despues de guardar.

## Admin movil

- [ ] El panel admin abre solo con rol autorizado.
- [ ] La gestion de universidad/facultad carga la informacion actual.
- [ ] La edicion de Mision, Vision y autoridades guarda correctamente.
- [ ] Los campos de cargo, nombre y correo de autoridades se pueden editar.
- [ ] Las imagenes de autoridades se pueden actualizar.
- [ ] El reporte de asistencia carga sin duplicar registros de no-shows.
- [ ] El reporte de certificados carga con sus filtros y descargas.
- [ ] Los cards y botones de admin no desbordan en pantallas pequenas.

## Archivos y permisos

- [ ] El selector de archivos abre cuando se necesita adjuntar un comprobante.
- [ ] La app maneja permisos denegados sin cerrarse.
- [ ] Los enlaces externos se abren correctamente.
- [ ] La previsualizacion de comprobantes funciona cuando el archivo es imagen.
- [ ] Los archivos PDF o URLs remotas se abren en el visor correcto.

## Calidad visual y usabilidad

- [ ] La app se ve bien en pantallas pequenas.
- [ ] La app se ve bien en pantallas grandes o tablet.
- [ ] Los textos largos no rompen las cards.
- [ ] Los modales se cierran tocando fuera o con boton visible.
- [ ] Los botones importantes tienen tamanio tactil correcto.
- [ ] Los estados vacios y de error son consistentes en toda la app.
- [ ] El scroll vertical no se traba en las pantallas largas.

## Modo oscuro

- [ ] La app cambia correctamente entre modo claro y modo oscuro.
- [ ] Los textos siguen siendo legibles en modo oscuro.
- [ ] Los botones conservan contraste suficiente en modo oscuro.
- [ ] Las cards y modales respetan los colores del tema oscuro.
- [ ] Los iconos y badges mantienen visibilidad en modo oscuro.
- [ ] Las pantallas de carga y estado vacío se ven bien en modo oscuro.
- [ ] No hay colores fijos que rompan la apariencia en modo oscuro.
- [ ] El modo oscuro no desordena márgenes, sombras ni bordes.

## Resiliencia

- [ ] La app responde bien con internet lento.
- [ ] La app responde bien si el backend no esta disponible.
- [ ] La app muestra error claro si la API devuelve 401.
- [ ] La app muestra error claro si la API devuelve 500.
- [ ] La app no se queda en loading infinito.
- [ ] Un refresh manual vuelve a consultar la data.