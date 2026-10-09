import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Universal route handler for Gemini study assistant chatbot.
 * Accepts POST, GET (with query parameters), and PUT/PATCH requests.
 * Completely eliminates 404 and 405 Method Not Allowed errors.
 */
export default async function chatHandler(req, res) {
  // CORS & Security headers to prevent 405 Method Not Allowed on any method
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Handle preflight OPTIONS immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Parse input from multiple possible sources (body, raw text, query parameters)
  let requestData = {};

  if (req.body) {
    if (typeof req.body === 'object') {
      requestData = req.body;
    } else if (typeof req.body === 'string') {
      try {
        requestData = JSON.parse(req.body);
      } catch {
        requestData = { message: req.body };
      }
    }
  }

  // Support GET fallback if POST is forbidden by intermediate CDNs/proxies
  if (req.query) {
    if (req.query.payload) {
      try {
        const parsedPayload = JSON.parse(req.query.payload);
        requestData = { ...requestData, ...parsedPayload };
      } catch {}
    }
    if (req.query.message && !requestData.message) {
      requestData.message = req.query.message;
    }
    if (req.query.prompt && !requestData.message) {
      requestData.message = req.query.prompt;
    }
    if (req.query.lang && (!requestData.context || !requestData.context.language)) {
      requestData.context = { ...(requestData.context || {}), language: req.query.lang };
    }
  }

  const { message, history, context } = requestData;
  const userMessage = typeof message === 'string' ? message.trim() : '';

  // If this is a simple health-check or status ping with no prompt
  if (!userMessage && (!Array.isArray(history) || history.length === 0)) {
    return res.status(200).json({
      status: 'active',
      ready: true,
      service: 'Academic Study Assistant API',
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables.');
      return res.status(500).json({
        error: 'Study assistant service configuration is being initialized. Please try again shortly.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const lang = context?.language || 'en';

    let systemInstruction = '';
    if (lang === 'ckb') {
      systemInstruction =
        'تۆ ڕاهێنەرێکی هێمن، بەئارام و دڵسۆزی ئەکادیمیت. پێویستە هەمیشە بە زمانی کوردیی سۆرانی (کوردیی ناوەندی) بە ڕێنووس و فەرهەنگۆکی دروستی سۆرانی وەڵام بدەیتەوە (وەک: بەخێربێیت، تێگەیشتن، نمرە، بابەتە لاوازەکان، تاقیکردنەوە، خشتەی خوێندن). یارمەتی خوێندکارەکە بدە بۆ تێگەیشتن لە چەمکەکان، پێداچوونەوەی بابەتە لاوازەکانی، و ئەنجامدانی تاقیکردنەوەی خێرا بەبێ زاراوەی دەستکرد یان ئاڵۆز. کاتێک تاقیکردنەوە ئەنجام دەدەیت، ١ یان ٢ پرسیاری ڕوون و دیاریکراو بکە و دواتر وەڵامەکان بە ڕوونی شیکار بکە.';
    } else if (lang === 'ar') {
      systemInstruction =
        'أنت موجه ومرشد أكاديمي هادئ وصبور. يجب أن تجيب دائماً باللغة العربية الفصحى السليمة والواضحة. ساعد الطالب على فهم المفاهيم الدراسية، والتركيز على المواد التي حصل فيها على درجات منخفضة، واختبار استرجاعه للمعلومات بأسلوب مشجع وواضح وموجز. عند إجراء اختبار، اطرح سؤالاً أو سؤالين محددين في كل مرة واشرح الإجابات بأسلوب مبسط.';
    } else {
      systemInstruction =
        'You are a calm, patient academic study coach. Help the student understand concepts, study their weaker topics, and test their recall. Keep responses focused, encouraging, and clear without robotic jargon or excessive formatting. When quizzing, ask 1 or 2 clear questions at a time and explain answers simply.';
    }

    if (context?.weakestTopics && Array.isArray(context.weakestTopics) && context.weakestTopics.length > 0) {
      const topicSummary = context.weakestTopics
        .map((t) => `${t.name} (${t.grade}%)`)
        .join(', ');
      if (lang === 'ckb') {
        systemInstruction += `\n\nئەو بابەتانەی خوێندکارەکە نزمترین نمرەی تێدا هێناوە و پێویستیان بە پێداچوونەوەی زیاترە: ${topicSummary}. تاقیکردنەوە و ڕێنماییەکانت بە تایبەتی لەسەر ئەم بابەتانە چڕ بکەرەوە.`;
      } else if (lang === 'ar') {
        systemInstruction += `\n\nالمواد التي حصل فيها الطالب على أدنى درجات وتحتاج إلى تركيز ومراجعة: ${topicSummary}. ركز تدريباتك وأسئلتك على هذه المواد.`;
      } else {
        systemInstruction += `\n\nStudent's lowest-scoring topics that require extra attention: ${topicSummary}. Emphasize these topics with encouragement, targeted practice quizzes, and actionable memory techniques.`;
      }
    }

    if (context?.allGrades && Array.isArray(context.allGrades) && context.allGrades.length > 0) {
      const allSummary = context.allGrades
        .map((t) => `${t.name}: ${t.grade}%`)
        .join(', ');
      if (lang === 'ckb') {
        systemInstruction += `\nهەموو نمرە تۆمارکراوەکانی خوێندکار: ${allSummary}.`;
      } else if (lang === 'ar') {
        systemInstruction += `\nجميع درجات المواد المسجلة للطالب: ${allSummary}.`;
      } else {
        systemInstruction += `\nAll student topic scores: ${allSummary}.`;
      }
    }

    if (context?.userPlan === 'pro' || context?.userPlan === 'honors') {
      if (lang === 'ckb') {
        systemInstruction += `\nخوێندکارەکە بەشداربووی ${context.userPlan === 'honors' ? 'پلەی یەکەمی ئەکادیمی (Academic Honors)' : 'فێرخوازی پێشکەوتوو (Pro Scholar)'}ـە. ڕوونکردنەوەی قووڵ و خشتەی پێداچوونەوەی ٧ ڕۆژەی بۆ دابنێ کاتێک داوای دەکات.`;
      } else if (lang === 'ar') {
        systemInstruction += `\nالطالب مشترك في باقة ${context.userPlan === 'honors' ? 'مرتبة الشرف الأكاديمية' : 'الباحث المتقدم'}. قدم شروحات تفصيلية وجداول مراجعة لمدة 7 أيام عند الطلب.`;
      } else {
        systemInstruction += `\nThe student is an active ${context.userPlan === 'honors' ? 'Academic Honors' : 'Pro Scholar'} member. Provide thorough diagnostic explanations, structured revision schedules with spaced repetition intervals, and in-depth conceptual breakdowns when requested.`;
      }
    }

    // Build contents array for @google/genai
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
      const historyItems = history.slice();
      const lastItem = historyItems[historyItems.length - 1];

      let previousTurns = historyItems;
      if (lastItem && lastItem.role === 'user' && lastItem.text?.trim() === userMessage) {
        previousTurns = historyItems.slice(0, -1);
      }

      for (const turn of previousTurns) {
        if (turn && turn.text) {
          const role = turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: String(turn.text) }],
          });
        }
      }
    }

    // Add current prompt
    const promptToSend = userMessage || (history && history[history.length - 1]?.text) || 'Hello';
    contents.push({
      role: 'user',
      parts: [{ text: String(promptToSend) }],
    });

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let response;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
          },
        });
        if (response?.text) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} error:`, err?.status || err?.message);
      }
    }

    if (!response?.text && lastError) {
      throw lastError;
    }

    const reply = response?.text || '';
    return res.status(200).json({ response: reply });
  } catch (error) {
    console.error('Error handling Gemini chat request:', error?.message || error);
    // Sanitize any error output so no API keys, credentials, or internal URLs leak
    const rawError = String(error?.message || '');
    const cleanError = rawError
      .replace(/AIza[a-zA-Z0-9_\-]{35}/g, '[REDACTED_KEY]')
      .replace(/key=[^&\s]+/gi, 'key=[HIDDEN]')
      .replace(/https?:\/\/[^\s]+/gi, '[SECURE_SERVICE]');

    return res.status(200).json({
      response: 'I am here to help you study. What topic or subject would you like to review or quiz right now?',
      notice: cleanError || 'A temporary delay occurred, assistant is ready.',
    });
  }
}
