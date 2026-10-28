import fs from 'fs';
import path from 'path';
import vm from 'vm';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const productsFilePath = path.join(projectRoot, 'js', 'products.js');
const productsCode = fs.readFileSync(productsFilePath, 'utf8');

// Run products.js in a sandbox where window exists
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(productsCode, sandbox);

const products = sandbox.window.PRODUCTS;
assert(Array.isArray(products), 'window.PRODUCTS should be an array');

for (const p of products) {
  assert.ok(p.name, 'Product must have a name');
  assert.ok(p.category, `Product ${p.name} must have a category`);
  assert.ok(p.image, `Product ${p.name} must have an image`);
  assert.ok(p.description, `Product ${p.name} must have a description`);
  assert.ok(p.dmText, `Product ${p.name} must have dmText`);

  if (!p.image.startsWith('http://') && !p.image.startsWith('https://')) {
    const localImgPath = path.join(projectRoot, p.image);
    assert(fs.existsSync(localImgPath), `Image file for "${p.name}" must exist at ${localImgPath}`);
  }
}

console.log(`✅ All tests passed! Checked ${products.length} products - all images verified on disk.`);
