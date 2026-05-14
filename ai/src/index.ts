import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

dotenv.config();

const app = express();
const port = process.env.AI_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 📝 Text Extraction from Buffer
async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (err) {
      // If PDF parsing fails, try treating it as plain text as a fallback
      console.warn('PDF parsing failed, falling back to plain text extraction');
      return buffer.toString('utf8');
    }
  }
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (mimetype === 'text/plain' || mimetype.startsWith('text/')) {
    return buffer.toString('utf8');
  }
  
  // Final fallback: try to read as text anyway if it's a common text-like format
  return buffer.toString('utf8');
}

// 🤖 AI Extraction with Groq
app.post('/extract', async (req: Request, res: Response) => {
  const { fileUrl, mimetype } = req.body;

  try {
    // 1. Fetch file
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Extract Text
    const text = await extractText(buffer, mimetype);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text could be extracted from the file' });
    }

    console.log(`Extracted ${text.length} characters from document`);

    // 3. Process with AI (Groq)
    const groqApiKey = process.env.GROK_API_KEY; // Using existing env var name
    if (!groqApiKey) {
      return res.status(500).json({ error: 'GROK_API_KEY (Groq) missing' });
    }

    const prompt = `
You are a specialized legal AI assistant. Extract key contract terms from the following contract text.

Return ONLY valid JSON with these exact fields:
{
  "contract_type": "string - e.g. NDA, MSA, SOW, Employment, SaaS Subscription, Lease, IP License, or Other",
  "counterparty_name": "string - the other party's name",
  "effective_date": "string - ISO date format YYYY-MM-DD or null",
  "expiration_date": "string - ISO date format YYYY-MM-DD or null",
  "auto_renewal": "boolean",
  "auto_renewal_terms": "string or null",
  "governing_law": "string - jurisdiction or null",
  "contract_value": "number or null - total monetary value",
  "payment_terms": "string or null",
  "liability_cap": "string or null",
  "indemnification_party": "string or null",
  "termination_for_convenience": "boolean",
  "termination_notice_days": "number or null",
  "risk_score": "number 1-100",
  "summary": "string - brief 2-3 sentence summary of the contract"
}

Contract Text:
${text.substring(0, 30000)}
`;

    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    const rawContent = aiResponse.data.choices[0].message.content;
    let extraction;
    
    try {
      extraction = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', rawContent);
      return res.status(500).json({ error: 'AI returned invalid JSON' });
    }
    
    console.log('Extraction successful:', Object.keys(extraction));
    res.json({ success: true, extraction, textLength: text.length });
  } catch (error: any) {
    console.error('Extraction failed:', error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// 🧠 Generate Embeddings
// Using Groq doesn't support embeddings natively, so we make this endpoint
// return null gracefully if no OpenAI key is configured
app.post('/embed', async (req: Request, res: Response) => {
  const { text } = req.body;

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    // If no valid OpenAI key is configured, skip embedding gracefully
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here' || openaiApiKey.length < 20) {
      console.log('OpenAI API key not configured — skipping embedding generation');
      return res.json({ success: true, embedding: null, skipped: true });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000), // OpenAI limit
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const embedding = response.data.data[0].embedding;
    res.json({ success: true, embedding });
  } catch (error: any) {
    console.error('Embedding failed:', error.message);
    // Return null instead of error so extraction still succeeds
    res.json({ success: true, embedding: null, error: error.message });
  }
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'legalpulse-ai', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🤖 AI Service running at http://localhost:${port}`);
  console.log(`📋 Extraction endpoint: POST /extract`);
  console.log(`🧠 Embedding endpoint: POST /embed`);
});
