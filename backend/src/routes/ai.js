// ai.js (CommonJS)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const router = express.Router();

router.post("/genai", async (req, res) => {
    let { message } = req.body;
    console.log(message)
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    async function main(mes = "hi") {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(mes);
        const response = await result.response;
        const text = await response.text();
        res.status(200).json({ reply: text });

    }

    main(message).catch((err) => console.log(err));
    res.send(0);
});
router.post("/genai/score", async (req, res) => {
    let { data } = req.body;
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `
      You are a Risk scoring assistant. 
      Input: ${JSON.stringify(data)}
      Task: Analyze this input and return a Risk_score(object key must be Risk_score) between 1 and 10  
      with a short reason.
      
    `;
    async function main(mes = "hi") {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(mes);
        const response = await result.response;
        let text = await response.text();
        
        res.status(200).json({ reply: text });

    }
    main(prompt).catch((err) => console.log(err));

    // res.send(0);
});
module.exports = router;