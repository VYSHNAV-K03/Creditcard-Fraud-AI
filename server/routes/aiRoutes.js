const express = require('express');
const router = express.Router();
const axios = require('axios');
const pdfParse = require("pdf-parse");
const multer = require("multer");
const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;


router.post("/analyze-text", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const response = await axios.post(
            "https://api-inference.huggingface.co/models/roberta-base-openai-detector",
            { inputs: text },
            {
                headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
            }
        );

        res.json({ result: response.data });
    } catch (error) {
        res.status(500).json({ error: "Error analyzing text", details: error.message });
    }
});

// Configure multer to accept only PDFs
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }
        cb(null, true);
    },
});

async function analyzeText(text, task) {
    const response = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        { inputs: `Extract ${task} from the following text: ${text}` },
        { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );
    return response.data[0]?.summary_text || "No data found";
}

router.post("/analyze-pdf", upload.single("pdf"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        const data = await pdfParse(req.file.buffer);
        const text = data.text.trim();
        if (!text) return res.status(400).json({ error: "Unable to extract text from PDF" });

        const truncatedText = text.substring(0, 5000);

        // Extract required insights using Hugging Face summarization model
        const [summary, taskPrioritization, resourceAllocation, riskAnalysis, errorRework, businessCost] =
            await Promise.all([
                analyzeText(truncatedText, "summary"),
                analyzeText(truncatedText, "task prioritization"),
                analyzeText(truncatedText, "resource allocation"),
                analyzeText(truncatedText, "risk analysis"),
                analyzeText(truncatedText, "error and rework analysis"),
                analyzeText(truncatedText, "business cost optimization"),
            ]);

        res.json({
            summary,
            taskPrioritization,
            resourceAllocation,
            riskAnalysis,
            errorRework,
            businessCost,
        });
    } catch (error) {
        console.error("Error processing PDF:", error.message);
        res.status(500).json({ error: "Error analyzing PDF", details: error.message });
    }
});



const WIKIPEDIA_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

const getWikipediaSummary = async (query) => {
    try {
        // First, search Wikipedia for the best matching page
        const searchResponse = await axios.get(
            `https://en.wikipedia.org/w/api.php`,
            {
                params: {
                    action: "query",
                    list: "search",
                    srsearch: query,
                    format: "json",
                },
            }
        );

        if (!searchResponse.data.query.search.length) {
            throw new Error("No Wikipedia page found for this topic.");
        }

        const pageTitle = searchResponse.data.query.search[0].title;

        // Fetch the summary of the first matching result
        const summaryResponse = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
        );

        return summaryResponse.data.extract || "No summary available.";
    } catch (error) {
        console.error("Wikipedia Error:", error.message);
        return "No context available.";
    }
};

router.post("/evaluate-answer", async (req, res) => {
    const { question, userAnswer } = req.body;

    try {
        // Get Wikipedia summary
        const context = await getWikipediaSummary(question);

        // Call Hugging Face API for answer evaluation
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
            { inputs: { question, context } },
            { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
        );

        const correctAnswer = response.data.answer || "No answer found";
        const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

        res.json({ correctAnswer, isCorrect, context });
    } catch (error) {
        res.status(500).json({ error: error.message || "Error evaluating answer" });
    }
});


const HF_SUMMARY_API = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HF_QA_API = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2";
const HF_API_KEY = HUGGINGFACE_API_KEY; // Replace with your API key

const headers = { Authorization: `Bearer ${HF_API_KEY}` };

// PDF Summarization Endpoint
let fullPdfText = ""; // Store full PDF text globally

router.post("/summarize", upload.single("pdf"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    try {
        const pdfText = await pdfParse(req.file.buffer);
        fullPdfText = pdfText.text; // Store the entire PDF text

        const response = await axios.post(HF_SUMMARY_API, { inputs: fullPdfText }, { headers });
        res.json({ summary: response.data[0].summary_text, fullText: fullPdfText });
    } catch (error) {
        console.error("Summarization Error:", error);
        res.status(500).json({ error: "Error summarizing PDF" });
    }
});


// Function to split text into chunks
const splitText = (text, chunkSize = 512, overlap = 50) => {
    let chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
};

router.post("/ask", async (req, res) => {
    const { question ,text} = req.body;

    console.log("Question:", question);
    console.log("Text:", text);
    

    if (!text || !question) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const textChunks = splitText(text);
        let answers = [];

        for (const chunk of textChunks) {
            const response = await axios.post(
                HF_QA_API,
                { inputs: { question, context: chunk } },
                { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
            );
            answers.push(response.data.answer);
        }


        // Return the most common answer
        const finalAnswer = answers.find(ans => ans) || "No relevant answer found.";
        res.json({ answer: finalAnswer });

    } catch (error) {
        console.error("QA Error:", error);
        res.status(500).json({ error: "Error answering question" });
    }
});


module.exports = router