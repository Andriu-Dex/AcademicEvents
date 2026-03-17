const { prisma } = require("../config/db");

function normalizeRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    tenantId: row.tenantId,
    accountId: row.accountId,
    blockedReason: row.blockedReason,
    blockedByAdminId: row.blockedByAdminId,
    blockedAt: row.blockedAt,
    unblockedReason: row.unblockedReason,
    unblockedByAdminId: row.unblockedByAdminId,
    unblockedAt: row.unblockedAt,
    isActive: row.isActive,
  };
}

async function getActiveBlock(tenantId, accountId) {
  const row = await prisma.accountBlockState.findFirst({
    where: {
      tenantId,
      accountId,
      isActive: true,
    },
    orderBy: {
      blockedAt: "desc",
    },
  });

  return normalizeRow(row);
}

async function getActiveBlocksByAccountIds(tenantId, accountIds) {
  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.accountBlockState.findMany({
    where: {
      tenantId,
      accountId: {
        in: accountIds,
      },
      isActive: true,
    },
  });

  return new Map(rows.map((row) => [row.accountId, normalizeRow(row)]));
}

async function blockAccount(
  { tenantId, accountId, reason, adminId },
  prismaClient = prisma
) {
  const trimmedReason = reason.trim();

  const row = await prismaClient.accountBlockState.create({
    data: {
      tenantId,
      accountId,
      blockedReason: trimmedReason,
      blockedByAdminId: adminId || null,
      isActive: true,
    },
  });

  return normalizeRow(row);
}

async function unblockAccount(
  { tenantId, accountId, reason, adminId },
  prismaClient = prisma
) {
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";

  const activeBlock = await prismaClient.accountBlockState.findFirst({
    where: {
      tenantId,
      accountId,
      isActive: true,
    },
    orderBy: {
      blockedAt: "desc",
    },
  });

  if (!activeBlock) {
    return null;
  }

  const row = await prismaClient.accountBlockState.update({
    where: {
      id: activeBlock.id,
    },
    data: {
      isActive: false,
      unblockedReason: trimmedReason,
      unblockedByAdminId: adminId || null,
      unblockedAt: new Date(),
    },
  });

  return normalizeRow(row);
}

module.exports = {
  getActiveBlock,
  getActiveBlocksByAccountIds,
  blockAccount,
  unblockAccount,
};
