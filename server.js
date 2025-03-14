import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import path from "path";
import productsRouter from "./src/routes/products.routes.js";
import cartsRouter from "./src/routes/carts.routes.js";
import { readFile, writeFile } from "./src/dao/fileManager.js";

const app = express();
const PORT = 8080;
const PRODUCTS_FILE = "productos.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "src/public")));

// Configuración de Handlebars
app.set("views", path.join(path.resolve(), "src/views"));
app.engine("handlebars", handlebars.engine({ defaultLayout: false }));
app.set("view engine", "handlebars");

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Página principal
app.get("/", (req, res) => {
    const products = readFile(PRODUCTS_FILE);
    res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
    const products = readFile(PRODUCTS_FILE);
    res.render("realTimeProducts", { products });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Configurar WebSockets
const io = new Server(server);
io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");

    socket.emit("updateProducts", readFile(PRODUCTS_FILE));

    socket.on("addProduct", (product) => {
        let products = readFile(PRODUCTS_FILE);
        product.id = Date.now().toString();
        products.push(product);
        writeFile(PRODUCTS_FILE, products);
        io.emit("updateProducts", products);
    });

    socket.on("deleteProduct", (id) => {
        let products = readFile(PRODUCTS_FILE).filter((p) => p.id.toString() !== id.toString());
        writeFile(PRODUCTS_FILE, products);
        io.emit("updateProducts", products);
    });
});
