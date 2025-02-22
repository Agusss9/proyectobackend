// Importar módulos necesarios
import express from "express";
import fs from "fs";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import path from "path";

const io = new Server();

const app = express();
const PORT = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PRODUCTS_FILE = "productos.json";
const CARTS_FILE = "carrito.json";

// Configuración de Handlebars
app.set("views", path.join(path.resolve(), "views"));
app.engine("handlebars", handlebars.engine({ defaultLayout: false }));
app.set("view engine", "handlebars");

// Leer datos desde archivo con validación
const readFile = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, "utf-8");
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

// Datos de productos (simulación de base de datos)
let products = [
    { id: 1, name: "Proteina", price: 10.99 },
    { id: 2, name: "Creatina", price: 9.99 },
];

// Ruta principal para evitar "Cannot GET /"
app.get("/", (req, res) => {
    res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", { products });
});

// Rutas de productos
const productsRouter = express.Router();
productsRouter.put("/:pid", (req, res) => {
    let products = readFile(PRODUCTS_FILE);
    const { pid } = req.params;
    const updatedProduct = req.body;
    
    const productIndex = products.findIndex(p => p.id.toString() === pid.toString());
    if (productIndex === -1) return res.status(404).json({ message: "Producto no encontrado" });

    products[productIndex] = { ...products[productIndex], ...updatedProduct, id: products[productIndex].id };
    writeFile(PRODUCTS_FILE, products);
    res.json({ message: "Producto actualizado", product: products[productIndex] });
});


productsRouter.delete("/:pid", (req, res) => {
    let products = readFile(PRODUCTS_FILE);
    const { pid } = req.params;
    products = products.filter(product => product.id !== pid);
    writeFile(PRODUCTS_FILE, products);
    res.json({ message: "Producto eliminado" });
});

// Rutas de carritos
const cartsRouter = express.Router();
cartsRouter.post("/", (req, res) => {
    let carts = readFile(CARTS_FILE);
    const newCart = { id: Date.now().toString(), products: [] };
    carts.push(newCart);
    writeFile(CARTS_FILE, carts);
    res.json({ message: "Carrito creado", cart: newCart });
});

cartsRouter.get("/:cid", (req, res) => {
    const carts = readFile(CARTS_FILE);
    const { cid } = req.params;
    const cart = carts.find(cart => cart.id === cid);
    res.json(cart ? cart.products : { message: "Carrito no encontrado" });
});

cartsRouter.post("/:cid/product/:pid", (req, res) => {
    let carts = readFile(CARTS_FILE);
    let products = readFile(PRODUCTS_FILE);
    const { cid, pid } = req.params;
    const cartIndex = carts.findIndex(cart => cart.id === cid);
    if (cartIndex === -1) return res.status(404).json({ message: "Carrito no encontrado" });

    let cart = carts[cartIndex];
    let existingProduct = cart.products.find(p => p.product === pid);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        if (!products.find(p => p.id === pid)) return res.status(404).json({ message: "Producto no encontrado" });
        cart.products.push({ product: pid, quantity: 1 });
    }
    carts[cartIndex] = cart;
    writeFile(CARTS_FILE, carts);
    res.json({ message: "Producto agregado al carrito", cart });
});

// Registrar los routers
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Configurar WebSockets
io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");
    
    socket.emit("updateProducts", products);
    
    socket.on("addProduct", (product) => {
        let products = readFile(PRODUCTS_FILE);
        if (products.length === 0) {
            products = [product];
        } else {
            product.id = Date.now().toString();
            products.push(product);
        }
        writeFile(PRODUCTS_FILE, products);
        io.emit("updateProducts", products);
    });

    socket.on("deleteProduct", (id) => {
        products = products.filter((p) => p.id.toString() !== id.toString());
        writeFile(PRODUCTS_FILE, products);
        io.emit("updateProducts", products);
    });    
});