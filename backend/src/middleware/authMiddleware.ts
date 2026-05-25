import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  username: string;
  rol: string;
}

export interface RequestConUsuario extends Request {
  usuario?: TokenPayload;
}

export const verificarToken = (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ mensaje: 'Token no proporcionado' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
};

export const verificarRol = (...roles: string[]) => (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    res.status(403).json({ mensaje: 'No tienes permiso' });
    return;
  }
  next();
};

