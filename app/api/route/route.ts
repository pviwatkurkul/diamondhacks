import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
export async function POST(request:Request) {
    try{
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
        }
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({model: "gemini-2.0-flash"});
        const data =  await request.json();
        const userPrompt = data.body || "Hello";

        const systemInstruction:string =  `Limit your responses to under 30 tokens
                
                These are the 5 things you must collect from the user. (1) The specific grocery names of the ingredient, (2) The dietary restrictions of the user (any allergies), (3) The amount of time they desire to cook, (4) The diet preference (vegan, vegetarian, pescatarian,etc), (5) The serving size of the meal (ex. 1 person, family of 4)
                
                Keep prompting the user in a friendly manner until you acquire these 5 requirements. However, feel free to end the conversation early and output the json, if you do acquire all 5 requirements. Do not ask questions that were already answered. 
                                
                Towards the end, prompt the user to ask if the 5 requirements you've compiled are correct, and then if they agree, output the following phrase: "Sit tight, while I compile some delicious recipes for you :)" and output the json format of the 5 requirements.
                For the ingredients in the json format, make sure all the ingredients are lower cased, spelled correctly, and separated by commas in an array. "`;
    
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig:{
                maxOutputTokens: 30,
            },
            systemInstruction: systemInstruction,
        });

        // Get the response text
        const response = result.response;
        const responseText = response.text();

        // Return the response
        return NextResponse.json({ response: responseText }, { status: 200 });
        } catch (error) {
            console.error("Error", error);
            return new Response(JSON.stringify({ error: "Something went wrong" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
}

