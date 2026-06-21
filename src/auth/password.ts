/**
 * ONE-MCN 密码哈希（bcrypt cost=12）
 * v5.1.4 D0-21 验证：grep -c 'bcrypt.hash' src/auth/password.ts >= 1 && grep 'cost' src/auth/password.ts | awk '{print $NF}' == 12
 */
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
