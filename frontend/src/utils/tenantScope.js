export const resolveTenantScope = () =>
  localStorage.getItem("tenantSlug") ||
  import.meta.env.VITE_TENANT_SLUG ||
  import.meta.env.VITE_TENANT_ID ||
  "uta";
