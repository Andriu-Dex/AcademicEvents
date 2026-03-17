/**
 * Auditoría mínima de acciones administrativas sensibles.
 * En entornos productivos puede reemplazarse por persistencia en DB o SIEM.
 */
function auditAdminAction({
  action,
  actor,
  tenantId,
  target = null,
  success = true,
  details = null,
  ip = null,
}) {
  const payload = {
    ts: new Date().toISOString(),
    action,
    success,
    tenantId,
    actor: actor
      ? {
          id: actor.id,
          role: actor.role || actor.rol_usu,
        }
      : null,
    target,
    ip,
    details,
  };

  if (success) {
    console.log("[AUDIT_ADMIN]", JSON.stringify(payload));
    return;
  }

  console.warn("[AUDIT_ADMIN]", JSON.stringify(payload));
}

module.exports = {
  auditAdminAction,
};
