import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { SiweMessage, generateNonce } from "siwe";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to read multiple object data


app.get("/nonce", async (req, res) => {
    const nonce = generateNonce();
    res.status(200).json({
        status: "success",
        data: {
            nonce: nonce
        }
    });
})

app.post("/verify", async (req, res) => {
    const {message, signature} = req.body;
    try {
        const siweMessage = new SiweMessage(message);
        const result = await siweMessage.verify({ signature });
        if (result.success) {
            address = result.data.address;
            console.log("address: ", address);
        }
        res.status(200).json({
            status:"success",
            data:{
                address : result.data.address
            }
        })
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({
            error:error.message
        })
    }
})

app.listen(8000, () => {
    console.log("Servfer is running on port 8000");
})

