const API_KEY = process.env.API_KEY;
export const requireAuth = (req, res, next) => {
    if (!API_KEY) {
        res.status(500).json({ success: false, message: "API key is not configured on the server" });
        return;
    }
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"];
    const providedToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : apiKeyHeader;
    if (!providedToken || providedToken !== API_KEY) {
        res.status(401).json({ success: false, message: "Unauthorized API Request" });
        return;
    }
    next();
};
