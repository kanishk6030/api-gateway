import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();


//This section  is beacuse the SUPABASE uses JWKS for managing keys
const client = jwksClient({
  jwksUri: `https://${process.env.PROJECT_ID}.supabase.co/auth/v1/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error("Missing or malformed Authorization header");
    return res.status(401).json({ message: "Unauthorized - Missing Bearer token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey,
     {
      algorithms: ["ES256"], // THIS IS THE KEY FIX
      audience: "authenticated", // Supabase standard
      issuer: `https://${process.env.PROJECT_ID}.supabase.co/auth/v1`
    },
     (err, decoded) => {
    if (err) {
      logger.error("JWT verification failed", { error: err.message });
      return res.status(403).json({ message: "Forbidden - Invalid token", error: err.message });
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role || "authenticated"
    };
    logger.info(`User authenticated`);
    next();
  });
}

export default authenticate;
