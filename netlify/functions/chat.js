import { GoogleGenAI } from '@google/genai';

export async function handler(event, context) {
  // Handle preflight OPTIONS requests cleanly with CORS headers
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  // Handle health-check or status GET requests with 200 OK
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ status: 'active', service: 'Academic Study Assistant API' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { message, history, context: userContext } = body;

    const userMessage = typeof message === 'string' ? message.trim() : '';

    if (!userMessage && (!Array.isArray(history) || history.length === 0)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Message or history is required.' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY is missing from environment.' }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const lang = userContext?.language || 'en';

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

    if (userContext?.weakestTopics && Array.isArray(userContext.weakestTopics) && userContext.weakestTopics.length > 0) {
      const topicSummary = userContext.weakestTopics
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

    if (userContext?.allGrades && Array.isArray(userContext.allGrades) && userContext.allGrades.length > 0) {
      const allSummary = userContext.allGrades
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

    if (userContext?.userPlan === 'pro' || userContext?.userPlan === 'honors') {
      if (lang === 'ckb') {
        systemInstruction += `\nخوێندکارەکە بەشداربووی ${userContext.userPlan === 'honors' ? 'پلەی یەکەمی ئەکادیمی (Academic Honors)' : 'فێرخوازی پێشکەوتوو (Pro Scholar)'}ـە. ڕوونکردنەوەی قووڵ و خشتەی پێداچوونەوەی ٧ ڕۆژەی بۆ دابنێ کاتێک داوای دەکات.`;
      } else if (lang === 'ar') {
        systemInstruction += `\nالطالب مشترك في باقة ${userContext.userPlan === 'honors' ? 'مرتبة الشرف الأكاديمية' : 'الباحث المتقدم'}. قدم شروحات تفصيلية وجداول مراجعة لمدة 7 أيام عند الطلب.`;
      } else {
        systemInstruction += `\nThe student is an active ${userContext.userPlan === 'honors' ? 'Academic Honors' : 'Pro Scholar'} member. Provide thorough diagnostic explanations, structured revision schedules with spaced repetition intervals, and in-depth conceptual breakdowns when requested.`;
      }
    }

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
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: reply }),
    };
  } catch (error) {
    console.error('Netlify function error:', error?.message || error);
    const rawError = String(error?.message || '');
    const cleanError = rawError
      .replace(/AIza[a-zA-Z0-9_\-]{35}/g, '[REDACTED_KEY]')
      .replace(/key=[^&\s]+/gi, 'key=[HIDDEN]')
      .replace(/https?:\/\/[^\s]+/gi, '[SECURE_SERVICE]');

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: cleanError || 'A temporary error occurred while processing your study question.' }),
    };
  }
}
