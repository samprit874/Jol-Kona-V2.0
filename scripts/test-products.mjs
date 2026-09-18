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

const chocolateBouquet = products.find(p => p.name === 'Chocolate Bouquet');
assert(chocolateBouquet, 'Chocolate Bouquet product should be defined in PRODUCTS');
assert.strictEqual(chocolateBouquet.category, 'gift-hampers', 'Category should be gift-hampers');
assert.ok(chocolateBouquet.badge, 'Badge should be defined');
assert.ok(chocolateBouquet.description, 'Description should be defined');
assert.ok(chocolateBouquet.dmText, 'dmText should be defined');

const imagePathOnDisk = path.join(projectRoot, chocolateBouquet.image);
assert(fs.existsSync(imagePathOnDisk), `Image file must exist at ${imagePathOnDisk}`);

console.log('✅ All tests passed for Chocolate Bouquet in Gift Hampers!');
