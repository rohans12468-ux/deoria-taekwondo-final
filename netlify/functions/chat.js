/* ════════════════════════════════════════════════════════════
   netlify/functions/chat.js
   ════════════════════════════════════════════════════════════
   This is the ONLY place your real Gemini API key is allowed
   to live. It runs on Netlify's servers, never in the visitor's
   browser, so it can never be copied from "View Source" and it
   never gets pushed to GitHub (it's not even written in this
   file — it's read from a secret "environment variable" that
   you set in the Netlify dashboard. See README.md, Step 5).

   This file is what your chatbot.js (in the browser) calls
   whenever a visitor sends a chat message.
   ════════════════════════════════════════════════════════════ */

// The association's info, used to build the AI's instructions below.
const ACADEMY_INFO =
  "Deoria Taekwondo Association (Ravindra Kishor Shahi Sports Stadium, Deoria, UP) " +
  "coached by Mr. Girish Singh — International Athlete, National Referee, 4th DAN Black Belt.";

// Builds the AI's personality/instructions, in the visitor's chosen language.
function buildSystemPrompt(lang) {
  if (lang === 'hinglish') {
    return `Tu ek expert Taekwondo coach AI hai "Coach AI" — ${ACADEMY_INFO} ka official virtual assistant. ` +
      `SIRF Taekwondo, sports fitness, diet, injury, belt grading, rules aur events ke baare mein jawab de. ` +
      `Off-topic pe bol: "Main sirf Taekwondo aur sports coach hoon 🥋" Hinglish mein baat kar, casual aur motivational tone. 150-600 words max.`;
  }
  return `You are "Coach AI" — expert Taekwondo & sports coach for ${ACADEMY_INFO}. ` +
    `ONLY answer about Taekwondo, sports fitness, athlete nutrition, injury prevention, belt grading, rules, competitions. ` +
    `Refuse off-topic politely. Professional, motivating tone. 150-600 words max.`;
}


async function askGroq(lang, history) {

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt(lang)
    }
  ];

  history.forEach(item => {
    messages.push({
      role: item.role === "model" ? "assistant" : item.role,
      content: item.parts[0].text
    });
  });

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.75,
        max_tokens: 600
      })
    }
  );

  if (!response.ok)
    throw new Error("Groq failed");

  const data = await response.json();

  return data.choices[0].message.content;
}

exports.handler = async (event) => {
  // Only allow POST requests (visitor sending a chat message)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // The secret key lives ONLY here, set in Netlify's dashboard environment variables.
  const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!geminiKey && !groqKey) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: "No AI API keys configured."
    })
  };
}

  try {
    const { lang, history } = JSON.parse(event.body || '{}');

    // Basic safety: don't let an empty or huge request through
    if (!Array.isArray(history) || history.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No message provided.' }) };
    }
    if (history.length > 40) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Conversation too long, please refresh the chat.' }) };
    }

    const safeLang = lang === 'hinglish' ? 'hinglish' : 'english';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(safeLang) }] },
        contents: history,
        generationConfig: { temperature: 0.75, maxOutputTokens: 600, topP: 0.9 }
      })
    });

    if (!response.ok) {

    console.log("Gemini failed");

    try {

        const groqReply =
            await askGroq(safeLang, history);

        return {
            statusCode:200,
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                reply:groqReply
            })
        };

    }
    catch{

        const errData =
        await response.json().catch(()=>({}));

        return {
            statusCode:502,
            body:JSON.stringify({
                error:
                errData?.error?.message
                ||
                "Both Gemini and Groq failed."
            })
        };

    }

}
   const data = await response.json();

const reply =
data.candidates?.[0]?.content?.parts?.[0]?.text
||
"Sorry, I couldn't generate a reply.";

return {
  statusCode: 200,
  headers: {
    "Content-Type":"application/json"
  },
  body: JSON.stringify({
    reply
  })
};
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected server error.' }) };
  }
};
