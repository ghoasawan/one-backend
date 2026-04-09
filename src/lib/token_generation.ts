import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { TokenPayloadDto } from '../Dtos/index.js';

export const generateToken = (payload: TokenPayloadDto): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiration = process.env.JWT_EXPIRATION || '1m';

  const token = jwt.sign(payload, secret, { expiresIn: expiration } as SignOptions);

  return token;
};

export const generateVerificationToken = (payload: TokenPayloadDto): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiration = process.env.JWT_VERIFICATION_EXPIRATION || '1h';

  const token = jwt.sign(payload, secret, { expiresIn: expiration } as SignOptions);

  return token;
};

export const verifyToken = (token: string): JwtPayload | string | null => {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
};
