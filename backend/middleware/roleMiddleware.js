/**
 * Role-based authorization middleware for VISHWAS Crime Data Portal
 * Usage: authorizeRoles('Police', 'Authority', 'Admin')
 * Must be used AFTER authMiddleware (requires req.user to be set)
 */

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
