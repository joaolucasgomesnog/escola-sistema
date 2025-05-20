

export default function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // O middleware authenticateToken deve rodar antes e setar req.userId e req.role
    if (!req.role) {
      return res.status(403).json({ error: 'Role do usuário não definido' });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: 'Usuário não autorizado' });
    }

    next();
  };
}
