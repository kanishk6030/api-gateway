import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dotenv from "dotenv";
dotenv.config();

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
    console.error("Missing or invalid Authorization header");
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
      console.error("JWT verify error:", err.message);
      console.error("JWT verify full error:", err);
      return res.status(403).json({ message: "Forbidden - Invalid token", error: err.message });
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role || "authenticated"
    };

    console.log("Authenticated user:", req.user);
    next();
  });
}

export default authenticate;
