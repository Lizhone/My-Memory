import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

console.log(
  'Gemini key loaded:',
  GEMINI_API_KEY
    ? `${GEMINI_API_KEY.slice(0, 10)}...`
    : 'MISSING'
);

// --------------------------------------------------
// Allowed memory categories
// --------------------------------------------------

const ALLOWED_CATEGORIES = [
  'Person',
  'Reminder',
  'Food',
  'Personal',
  'Work',
  'Place',
  'Other'
];

// --------------------------------------------------
// Call Gemini
// --------------------------------------------------

const callGemini = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return (
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  );
};

// --------------------------------------------------
// Extract information from memory text
// --------------------------------------------------

export const extractMemoryInfo = async (text) => {
  try {
    const prompt = `
You are the AI memory assistant for an application called "My Memory".

Analyze the user's memory and extract useful structured information.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations.

Use exactly this structure:

{
  "title": "short useful title",
  "summary": "brief summary",
  "category": "Person | Reminder | Food | Personal | Work | Place | Other",
  "tags": [],
  "people": [],
  "places": [],
  "organizations": [],
  "dates": [],
  "tasks": [],
  "reminder": null
}

CATEGORY RULES:

1. You MUST choose exactly ONE category from:
   Person
   Reminder
   Food
   Personal
   Work
   Place
   Other

2. FOOD
Use "Food" when the memory is mainly about:
- food
- restaurants
- cafes
- meals
- dishes
- drinks
- food recommendations
- places to eat

Example:
"Tith said the food at Al-dazz is really good."
→ Food

3. WORK
Use "Work" when the memory is mainly about:
- office
- workplace
- job
- coworkers
- manager
- work projects
- work meetings
- work deadlines
- professional tasks

Example:
"I have to go to the office next week."
→ Work

4. REMINDER
Use "Reminder" when the main purpose is something the user needs to remember or do.

Examples:
"I need to buy a new charger tomorrow."
→ Reminder

"I have to renew my passport next month."
→ Reminder

"I have a doctor appointment on October 1st."
→ Reminder

5. PERSON
Use "Person" when the main subject is a specific person or relationship.

Examples:
"Sarah prefers morning meetings."
→ Person

"My brother loves football."
→ Person

6. PLACE
Use "Place" when the main subject is a location.

Examples:
"I really like the cafe near my house."
→ Place

"That restaurant near my office is amazing."
→ Place

7. PERSONAL
Use "Personal" only when the information is genuinely personal but does not clearly belong to Food, Work, Reminder, Person, or Place.

8. OTHER
Use "Other" only when none of the above categories clearly apply.

9. Do NOT automatically choose Personal.

10. Do NOT automatically choose Other.

11. When multiple categories are possible, choose the category that best represents the MAIN purpose of the memory.

12. Only extract information that is actually present in the user's text.

13. Never invent names, dates, places, tasks, relationships or other facts.

Memory:
${text}
`;

    const content = await callGemini(prompt);

    if (!content) {
      throw new Error('Gemini returned an empty response');
    }

    // Remove markdown code fences if Gemini adds them
    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const extracted = JSON.parse(cleaned);

    // Validate category
    const category = ALLOWED_CATEGORIES.includes(
      extracted.category
    )
      ? extracted.category
      : 'Other';

    return {
      title: extracted.title || text.substring(0, 100),

      summary:
        extracted.summary ||
        text.substring(0, 200),

      category,

      tags: Array.isArray(extracted.tags)
        ? extracted.tags
        : [],

      people: Array.isArray(extracted.people)
        ? extracted.people
        : [],

      places: Array.isArray(extracted.places)
        ? extracted.places
        : [],

      organizations: Array.isArray(extracted.organizations)
        ? extracted.organizations
        : [],

      dates: Array.isArray(extracted.dates)
        ? extracted.dates
        : [],

      tasks: Array.isArray(extracted.tasks)
        ? extracted.tasks
        : [],

      reminder: extracted.reminder || null
    };
  } catch (err) {
    console.error(
      'Gemini extraction error:',
      err.response?.data || err.message
    );

    // Safe fallback
    return {
      title: text.substring(0, 100),

      summary: text.substring(0, 200),

      category: 'Other',

      tags: [],

      people: [],

      places: [],

      organizations: [],

      dates: [],

      tasks: [],

      reminder: null
    };
  }
};

// --------------------------------------------------
// Answer questions using user's memories
// --------------------------------------------------

export const answerQuestion = async (question, memories) => {
  try {
    const memoriesContext = memories
      .map(
        (m, i) => `
MEMORY ${i + 1}

Title:
${m.title || 'Untitled'}

Summary:
${m.summary || ''}

Category:
${m.category || 'Other'}

Original:
${m.original_text}

Date:
${m.created_at}
`
      )
      .join('\n');

    const prompt = `
You are the AI memory assistant for "My Memory".

Answer the user's question using ONLY the saved memories below.

IMPORTANT RULES:

1. Compare the MEANING of the question with the MEANING of each memory.

2. Do NOT require exact keyword matches.

3. Understand synonyms and paraphrasing.

4. Understand dates, people, places, tasks, reminders and context.

5. Example:

Memory:
"I have to go to the office next week."

Question:
"What was I supposed to do next week?"

These refer to the same information.

6. Another example:

Memory:
"I have a doctor appointment on October 1st."

Question:
"Do I have any appointments in October?"

These refer to the same information.

7. Never invent information.

8. Do not make assumptions that are not supported by the memories.

9. If relevant information exists, answer naturally and directly.

10. If multiple memories are relevant, combine them into one useful answer.

11. If no relevant information exists, say exactly:

"I couldn't find anything about that in your memories."

12. Include the relevant memory number in brackets, for example [1] or [2].

USER'S SAVED MEMORIES:

${memoriesContext}

USER'S QUESTION:

${question}

Answer ONLY from the saved memories above.
`;

    const answer = await callGemini(prompt);

    if (!answer) {
      throw new Error('Gemini returned an empty answer');
    }

    return answer.trim();
  } catch (err) {
    console.error(
      'Gemini answer error:',
      err.response?.data || err.message
    );

    throw new Error('Failed to process question');
  }
};