import crypto from 'node:crypto'

const algorithm = 'aes-192-cbc';
const password = 'devilwjp is master';
// Use the async `crypto.scrypt()` instead.
const key = crypto.scryptSync(password, 'salt', 24);
// Use `crypto.randomBytes` to generate a random iv instead of the static iv
// shown here.
const iv = Buffer.alloc(16, 0); // Initialization vector.

const cipher = crypto.createCipheriv(algorithm, key, iv);

export function encrypt(content: string): string {
    let encrypted: string = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted
}

export function decrypt(hash: string): string {
    let decrypted: string = cipher.update(hash, 'hex', 'utf8');
    decrypted += cipher.final('utf8');
    return decrypted
}
