import { Router } from "express";
import { readFile, writeFile } from "../dao/fileManager.js";

const router = Router();
const CARTS_FILE = "carts.json";

// Obtener un carrito por ID
router.get("/:cid", (req, res) => {
    const { cid } = req.params;
    const carts = readFile(CARTS_FILE);
    const cart = carts.find(c => c.id.toString() === cid);

    if (!cart) {
        return res.status(404).send("Carrito no encontrado");
    }
    res.send(cart);
});

// Agregar un producto al carrito
router.post("/:cid/products/:pid", (req, res) => {
    const { cid, pid } = req.params;
    let carts = readFile(CARTS_FILE);
    let cart = carts.find(c => c.id.toString() === cid);

    if (!cart) {
        return res.status(404).send("Carrito no encontrado");
    }

    let product = cart.products.find(p => p.id.toString() === pid);
    if (product) {
        product.quantity += 1;
    } else {
        cart.products.push({ id: pid, quantity: 1 });
    }

    writeFile(CARTS_FILE, carts);
    res.send({ message: "Producto agregado al carrito", cart });
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", (req, res) => {
    const { cid, pid } = req.params;
    let carts = readFile(CARTS_FILE);
    let cart = carts.find(c => c.id.toString() === cid);

    if (!cart) {
        return res.status(404).send("Carrito no encontrado");
    }

    cart.products = cart.products.filter(p => p.id.toString() !== pid);
    writeFile(CARTS_FILE, carts);
    
    res.send({ message: "Producto eliminado del carrito", cart });
});

// Actualizar el carrito con un nuevo arreglo de productos
router.put("/:cid", (req, res) => {
    const { cid } = req.params;
    const newProducts = req.body.products; // Recibe un array de productos
    let carts = readFile(CARTS_FILE);
    let cartIndex = carts.findIndex(c => c.id.toString() === cid);

    if (cartIndex === -1) {
        return res.status(404).send("Carrito no encontrado");
    }

    carts[cartIndex].products = newProducts;
    writeFile(CARTS_FILE, carts);

    res.send({ message: "Carrito actualizado", cart: carts[cartIndex] });
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    let carts = readFile(CARTS_FILE);
    let cart = carts.find(c => c.id.toString() === cid);

    if (!cart) {
        return res.status(404).send("Carrito no encontrado");
    }

    let product = cart.products.find(p => p.id.toString() === pid);

    if (!product) {
        return res.status(404).send("Producto no encontrado en el carrito");
    }

    product.quantity = quantity;
    writeFile(CARTS_FILE, carts);

    res.send({ message: "Cantidad actualizada", cart });
});

// Eliminar todos los productos del carrito
router.delete("/:cid", (req, res) => {
    const { cid } = req.params;
    let carts = readFile(CARTS_FILE);
    let cart = carts.find(c => c.id.toString() === cid);

    if (!cart) {
        return res.status(404).send("Carrito no encontrado");
    }

    cart.products = [];
    writeFile(CARTS_FILE, carts);

    res.send({ message: "Todos los productos eliminados del carrito", cart });
});

export default router;
