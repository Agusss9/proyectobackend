import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Referencia al modelo de productos
            quantity: { type: Number, required: true, default: 1 }
        }
    ]
}, { timestamps: true }); // Agrega fecha de creación y actualización

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
