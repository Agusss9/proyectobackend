import { Router } from "express";
import { Product } from "../models/Product.js";  // Importamos el modelo de productos

const router = Router();

// 📌 Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});

// 📌 Obtener un producto por ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

// 📌 Agregar un nuevo producto
router.post("/", async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const newProduct = new Product({ name, description, price, stock });
        await newProduct.save();
        res.status(201).json({ message: "Producto agregado", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el producto" });
    }
});

// 📌 Actualizar un producto por ID
router.put("/:id", async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ message: "Producto actualizado", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// 📌 Eliminar un producto por ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

export default router;

router.get("/", async (req, res) => {
    try {
        const products = await productModel.find(); // Trae los productos de la BD
        res.render("products", { products });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener los productos");
    }
});

