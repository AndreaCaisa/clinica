import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registro = async (req: Request, res: Response): Promise<void> => {
  const { username, password, rol } = req.body;
  if (!username || !password || !rol) {
    res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    return;
  }
  const existe = await prisma.usuarioSistema.findUnique({ where: { username } });
  if (existe) {
    res.status(409).json({ mensaje: 'El usuario ya existe' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuarioSistema.create({
    data: { username, password: passwordHash, rol },
  });
  res.status(201).json({ mensaje: 'Usuario creado', id: usuario.id, username: usuario.username, rol: usuario.rol });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ mensaje: 'Usuario y contrasena requeridos' });
    return;
  }
  const usuario = await prisma.usuarioSistema.findUnique({ where: { username } });
  if (!usuario || !usuario.activo) {
    res.status(401).json({ mensaje: 'Credenciales invalidas' });
    return;
  }
  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) {
    res.status(401).json({ mensaje: 'Credenciales invalidas' });
    return;
  }
  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, rol: usuario.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' },
  );
  res.json({ token, usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol } });
};

