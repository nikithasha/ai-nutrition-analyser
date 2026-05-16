import Groq from 'groq-sdk';
import { searchUSDA } from './usda';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyseMeal = async (mealText) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `Analyse the nutrition of this meal: "${mealText}".
        Break down EACH food item separately and also give totals.
        Return ONLY this exact JSON format, nothing else:
        {
          "items": [
            {
              "name": "food item name with quantity",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fats": number,
              "fiber": number
            }
          ],
          "calories": total number,
          "protein": total number,
          "carbs": total number,
          "fats": total number,
          "fiber": total number,
          "quantity": "brief description of all portions",
          "summary": "one sentence about overall health of this meal",
          "mainFood": "the single most prominent food item name only"
        }`
      }
    ]
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  const aiResult = JSON.parse(clean);

  try {
    const usdaResult = await searchUSDA(aiResult.mainFood);
    if (usdaResult) {
      return { ...aiResult, usdaVerified: true, usdaName: usdaResult.name };
    }
  } catch (err) {
    console.log('USDA lookup failed');
  }

  return aiResult;
};

export const analyseMealFromImage = async (imageFile) => {
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(imageFile);
  });

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
          {
            type: 'text',
            text: `Look at this meal photo and analyse each food item separately.
            Return ONLY this exact JSON format, nothing else:
            {
              "foodName": "name of the full meal",
              "items": [
                {
                  "name": "food item name with estimated quantity",
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fats": number,
                  "fiber": number
                }
              ],
              "calories": total number,
              "protein": total number,
              "carbs": total number,
              "fats": total number,
              "fiber": total number,
              "quantity": "estimated serving sizes",
              "summary": "one sentence about the meal",
              "mainFood": "most prominent food item"
            }`
          }
        ]
      }
    ]
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  const aiResult = JSON.parse(clean);

  try {
    const usdaResult = await searchUSDA(aiResult.mainFood);
    if (usdaResult) {
      return { ...aiResult, usdaVerified: true, usdaName: usdaResult.name };
    }
  } catch (err) {
    console.log('USDA lookup failed');
  }

  return aiResult;
};