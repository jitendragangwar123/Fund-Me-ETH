import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { SiweMessage, generateNonce } from "siwe";

const app = express();
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to read multiple object data

let address = "";
app.get("/address", async (req, res) => {
    res.status(200).json({ address });
})

app.get("/nonce", async (req, res) => {
    const nonce = generateNonce();
    res.status(200).json({
        nonce: nonce
    });
});

app.post("/verify", async (req, res) => {
    const { message, signature } = req.body;
    try {
        const siweMessage = new SiweMessage(message);
        const result = await siweMessage.verify({ signature });
        if (result.success) {
            address = result.data.address;
            console.log("address: ", address);
        }
        res.status(200).json({
            ok: result.success,
        })
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({
            error: error.message
        })
    }
});

app.get("/logout", async (req, res) => {
    console.log("logout");
    res.status(200).json({
        
    })
});

app.listen(8000, () => {
    console.log("Servfer is running on port 8000");
})

