const mongoose = require('mongoose');
const { Long } = require('mongodb');
const OpenAI = require("openai");
require('dotenv').config();

const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Convert structured transcription items to formatted conversation
function formatTranscriptionFromItems(transcriptionItems) {
    if (!transcriptionItems || !Array.isArray(transcriptionItems)) {
        return null;
    }
    
    let formattedConversation = '';
    
    transcriptionItems.forEach(item => {
        if (item.type === 'message' && item.content && Array.isArray(item.content)) {
            const speaker = item.role === 'user' ? '**User:**' : '**AI Assistant:**';
            const content = item.content.join(' '); // Join array content into single string
            formattedConversation += `${speaker} ${content}\n\n`;
        }
    });
    
    return formattedConversation.trim();
}

// Translate formatted conversation to English using OpenAI
async function translateTranscriptToEnglish(formattedTranscript) {
    if (!formattedTranscript) return null;

    const prompt = `
Translate the following structured conversation into English, keeping the markdown format exactly as is.

- Do not add any introductions, explanations, summaries, or extra text.
- Only return the translated conversation.
- Keep "**User:**" and "**AI Assistant:**" exactly as they appear.
- Maintain proper line breaks and spacing between turns.
- Preserve proper names (like person names or bank names etc) without interpreting or changing their meaning.
- The response must begin directly with "**User:**" or "**AI Assistant:**" as per the first line of the input.

Structured conversation:

${formattedTranscript}
`;

    try {
        const completion = await openAi.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error translating transcript:', error);
        return formattedTranscript;
    }
}

// Process and translate transcription from new format
async function processAndTranslateTranscription(transcriptionItems) {
    try {
        const formattedTranscript = formatTranscriptionFromItems(transcriptionItems);

        if (!formattedTranscript) {
            console.warn('No formatted transcript returned.');
            return { formattedTranscript: null, translatedTranscript: null };
        }

        const translatedTranscript = await translateTranscriptToEnglish(formattedTranscript);

        return {
            formattedTranscript,
            translatedTranscript,
        };
    } catch (error) {
        console.error('Error during processing and translation:', error);
        return {
            formattedTranscript: null,
            translatedTranscript: null,
        };
    }
}

// Create text representation from transcription items for analysis
function createTextFromTranscriptionItems(transcriptionItems) {
    if (!transcriptionItems || !Array.isArray(transcriptionItems)) {
        return null;
    }
    
    let textRepresentation = '';
    
    transcriptionItems.forEach(item => {
        if (item.type === 'message' && item.content && Array.isArray(item.content)) {
            const speaker = item.role === 'user' ? 'Customer' : 'Agent';
            const content = item.content.join(' ');
            textRepresentation += `${speaker}: ${content}\n`;
        }
    });
    
    return textRepresentation.trim();
}

// Analyze call transcription using the new format
async function analyzeCallTranscription(transcriptionItems, customerName, productName = null) {
    if (!transcriptionItems || !Array.isArray(transcriptionItems)) return null;
    
    const transcriptionText = createTextFromTranscriptionItems(transcriptionItems);
    if (!transcriptionText) return null;
    
    const prompt = `
    Analyze the following call transcription between a bank agent and a customer named ${customerName}${productName ? ` regarding ${productName}` : ''}. 
    Provide a detailed analysis in the following JSON format:
    
    {
        "summary": "A 1-2 sentence summary of the overall call",
        "sentiment": {
            "positive": 65,  // A percentage value between 0-100
            "description": "Brief statement about sentiment"
        },
        "keyTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
        "painPoints": [
            "Concerned about X",
            "Questioned Y",
            "Mentioned Z"
        ],
        "agentPerformance": {
            "clarity": 8,  // Score out of 10
            "objectionHandling": 7  // Score out of 10
        },
        "recommendations": [
            "Next step 1",
            "Next step 2",
            "Next step 3"
        ]
    }
    
    Call transcription:
    ${transcriptionText}
    `;
    
    try {
        const completion = await openAi.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error analyzing transcription:', error);
        return null;
    }
}

const getAllCalls = async (req, res) => {
    try {
        const calls = await mongoose.connection
            .collection('records')
            .find({})
            .toArray();
        const formattedCalls = calls.map(call => {
            const formattedCall = { ...call };
            
            // Format Long values
            if (formattedCall.started_at && typeof formattedCall.started_at === 'object') {
                const longValue = new Long(
                    formattedCall.started_at.low, 
                    formattedCall.started_at.high, 
                    formattedCall.started_at.unsigned
                );
                formattedCall.started_at = longValue.toString();
            }
            
            if (formattedCall.ended_at && typeof formattedCall.ended_at === 'object') {
                const longValue = new Long(
                    formattedCall.ended_at.low, 
                    formattedCall.ended_at.high, 
                    formattedCall.ended_at.unsigned
                );
                formattedCall.ended_at = longValue.toString();
            }
            
            // Remove transcription completely
            delete formattedCall.transcription;
            
            return formattedCall;
        });
        
        return res.status(200).json(formattedCalls);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getCallTranscription = async (req, res) => {
    try {
        const { egress_id } = req.params;
        
        if (!egress_id) {
            return res.status(400).json({ error: 'egress_id is required' });
        }
        
        const call = await mongoose.connection
            .collection('records')
            .findOne({ egress_id });
            
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }
        
        if (!call.transcription || !call.transcription.items) {
            return res.status(404).json({ error: 'No transcription available for this call' });
        }
        
        const { formattedTranscript, translatedTranscript } = await processAndTranslateTranscription(call.transcription.items);
        
        return res.status(200).json({ 
            egress_id,
            transcription: formattedTranscript,
            translated: translatedTranscript,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getCallAnalysis = async (req, res) => {
    try {
        const { egress_id } = req.params;
        
        if (!egress_id) {
            return res.status(400).json({ error: 'egress_id is required' });
        }
        
        const call = await mongoose.connection
            .collection('records')
            .findOne({ egress_id });
            
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }
        
        if (!call.transcription || !call.transcription.items) {
            return res.status(404).json({ error: 'No transcription available for this call' });
        }
        
        const productName = call.product_name || null;
        const analysis = await analyzeCallTranscription(call.transcription.items, call.cust_name, productName);
        
        if (!analysis) {
            return res.status(500).json({ error: 'Failed to analyze call' });
        }
        
        return res.status(200).json({
            egress_id,
            cust_name: call.cust_name,
            product_name: productName,
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            keyTopics: analysis.keyTopics,
            painPoints: analysis.painPoints,
            agentPerformance: analysis.agentPerformance,
            recommendations: analysis.recommendations
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllCalls, getCallTranscription, getCallAnalysis };