const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Specific role check functions
const requireAdmin = roleCheck(['admin']);
const requireDoctor = roleCheck(['doctor', 'admin']);
const requirePatient = roleCheck(['patient', 'doctor', 'admin']);

module.exports = {
  roleCheck,
  requireAdmin,
  requireDoctor,
  requirePatient
};
