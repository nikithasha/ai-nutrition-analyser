import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyseMeal = async (mealText) => {
  const response = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'user',
        content: `Analyse the nutrition of this meal: ${mealText}. 
        Give me a JSON response with exactly this format:
        {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number,
          "summary": "one sentence about the meal"
        }
        Only respond with the JSON, nothing else.`
      }
    ]
  });

  const text = response.choices[0].message.content;
  return JSON.parse(text);
};