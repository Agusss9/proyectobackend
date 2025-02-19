// Importar módulos necesarios
import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 8080;
app.use(express.json());

const PRODUCTS_FILE = 'productos.json';
const CARTS_FILE = 'carrito.json';

// Leer datos desde archivo con validación
const readFile = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, 'utf-8');
        return JSON.parse(data) || [];
    } catch (error) {
        console.error(`Error leyendo ${file}:`, error);
        return [];
    }
};

// Escribir datos en archivo con validación
const writeFile = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error escribiendo en ${file}:`, error);
    }
};

// Ruta principal para evitar "Cannot GET /"
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de productos y carritos!');
});

// Rutas de productos
const productsRouter = express.Router();
productsRouter.put('/:pid', (req, res) => {
    let products = readFile(PRODUCTS_FILE);
    const { pid } = req.params;
    const updatedProduct = req.body;

    if (!updatedProduct || Object.keys(updatedProduct).length === 0) {
        return res.status(400).json({ message: 'Datos de actualización inválidos' });
    }

    products = products.map(product => product.id === pid ? { ...product, ...updatedProduct, id: product.id } : product);
    writeFile(PRODUCTS_FILE, products);
    res.json({ message: 'Producto actualizado', product: updatedProduct });
});

productsRouter.delete('/:pid', (req, res) => {
    let products = readFile(PRODUCTS_FILE);
    const { pid } = req.params;
    products = products.filter(product => product.id !== pid);
    writeFile(PRODUCTS_FILE, products);
    res.json({ message: 'Producto eliminado' });
});

// Rutas de carritos
const cartsRouter = express.Router();
cartsRouter.post('/', (req, res) => {
    let carts = readFile(CARTS_FILE);
    const newCart = { id: Date.now().toString(), products: [] };
    carts.push(newCart);
    writeFile(CARTS_FILE, carts);
    res.json({ message: 'Carrito creado', cart: newCart });
});

cartsRouter.get('/:cid', (req, res) => {
    const carts = readFile(CARTS_FILE);
    const { cid } = req.params;
    const cart = carts.find(cart => cart.id === cid);
    res.json(cart ? cart.products : { message: 'Carrito no encontrado' });
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
    let carts = readFile(CARTS_FILE);
    let products = readFile(PRODUCTS_FILE);
    const { cid, pid } = req.params;
    const cartIndex = carts.findIndex(cart => cart.id === cid);
    if (cartIndex === -1) return res.status(404).json({ message: 'Carrito no encontrado' });

    let cart = carts[cartIndex];
    let existingProduct = cart.products.find(p => p.product === pid);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        if (!products.find(p => p.id === pid)) return res.status(404).json({ message: 'Producto no encontrado' });
        cart.products.push({ product: pid, quantity: 1 });
    }
    carts[cartIndex] = cart;
    writeFile(CARTS_FILE, carts);
    res.json({ message: 'Producto agregado al carrito', cart });
});

// Registrar los routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Servidor corriendo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
