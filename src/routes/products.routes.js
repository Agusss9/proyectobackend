import { Router } from "express";
import { readFile, writeFile } from "../dao/fileManager.js";

const router = Router();
const PRODUCTS_FILE = "productos.json";

router.get("/", (req, res) => {
    const products = readFile(PRODUCTS_FILE);
    res.json(products);
});

router.put("/:pid", (req, res) => {
    let products = readFile(PRODUCTS_FILE);
    const { pid } = req.params;
    const updatedProduct = req.body;
    
    const productIndex = products.findIndex(p => p.id.toString() === pid.toString());
    if (productIndex === -1) return res.status(404).json({ message: "Producto no encontrado" });

    products[productIndex] = { ...products[productIndex], ...updatedProduct, id: products[productIndex].id };
    writeFile(PRODUCTS_FILE, products);
    res.json({ message: "Producto actualizado", product: products[productIndex] });
});

router.delete("/:pid", (req, res) => {
    let products = readFile(PRODUCTS_FILE);
    const { pid } = req.params;
    products = products.filter(product => product.id.toString() !== pid.toString());
    writeFile(PRODUCTS_FILE, products);
    res.json({ message: "Producto eliminado" });
});

export default router;
