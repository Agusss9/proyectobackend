import { Router } from "express";
import { readFile, writeFile } from "../dao/fileManager.js";

const router = Router();
const CARTS_FILE = "carrito.json";
const PRODUCTS_FILE = "productos.json";

router.post("/", (req, res) => {
    let carts = readFile(CARTS_FILE);
    const newCart = { id: Date.now().toString(), products: [] };
    carts.push(newCart);
    writeFile(CARTS_FILE, carts);
    res.json({ message: "Carrito creado", cart: newCart });
});

router.get("/:cid", (req, res) => {
    const carts = readFile(CARTS_FILE);
    const { cid } = req.params;
    const cart = carts.find(cart => cart.id === cid);
    res.json(cart ? cart.products : { message: "Carrito no encontrado" });
});

router.post("/:cid/product/:pid", (req, res) => {
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
        if (!products.find(p => p.id.toString() === pid.toString())) return res.status(404).json({ message: "Producto no encontrado" });
        cart.products.push({ product: pid, quantity: 1 });
    }
    carts[cartIndex] = cart;
    writeFile(CARTS_FILE, carts);
    res.json({ message: "Producto agregado al carrito", cart });
});

export default router;
