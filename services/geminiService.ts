
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ProjectDetails, ChatMessage, GeneratedDocs, ChatRole } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const startConversation = async (projectDetails: ProjectDetails): Promise<{ chat: Chat; firstMessage: string }> => {
    const systemInstruction = `You are a world-class Senior Engineering Manager conducting a project scoping session. Your goal is to transform a user's vague idea into a crystal-clear set of requirements for an AI coding agent.

    **Your Process:**
    1.  **Acknowledge & Confirm:** Briefly acknowledge the user's idea to show you've understood.
    2.  **Ask One Clarifying Question:** Ask ONE intelligent, targeted question at a time to dive deeper into a specific aspect of the project. Your questions should be inspired by best practices for building robust software.
    3.  **Be Concise:** Keep your responses and questions short and to the point. Avoid long paragraphs.
    4.  **Guide the Conversation:** Methodically cover key areas: features, user flow, data models, non-functional requirements (like authentication, performance), and edge cases.
    
    Here is the user's initial project brief:
    - **Project Idea:** "${projectDetails.idea}"
    - **Project Type:** ${projectDetails.projectType}
    - **Target Audience:** ${projectDetails.audience}
    - **Key Goal:** "${projectDetails.goal}"
    - **Preferred Tech Stack (if any):** "${projectDetails.techStack}"
    
    Start the conversation now. Acknowledge their idea and ask your first, most critical question.`;

    const chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    const response = await chat.sendMessage({ message: "Let's begin." });
    const firstMessage = response.text.trim();
    
    return { chat, firstMessage };
};

export const continueConversation = async (chat: Chat, message: string): Promise<string> => {
    const response = await chat.sendMessage({ message });
    return response.text.trim();
};

export const generateDocuments = async (projectDetails: ProjectDetails, chatHistory: ChatMessage[]): Promise<GeneratedDocs> => {
    const conversationTranscript = chatHistory
        .map(msg => `${msg.role === ChatRole.USER ? 'User' : 'AI Assistant'}: ${msg.text}`)
        .join('\n');
    
    const prompt = `
      Act as a 10x Principal Engineer. Based on the initial project brief and the detailed conversation transcript below, generate three complete, production-ready markdown documents for an AI coding agent.

      **Initial Project Brief:**
      - Project Idea: "${projectDetails.idea}"
      - Project Type: ${projectDetails.projectType}
      - Target Audience: ${projectDetails.audience}
      - Key Goal: "${projectDetails.goal}"
      - Preferred Tech Stack: "${projectDetails.techStack}"

      **Full Conversation Transcript:**
      ${conversationTranscript}

      **Your Task:**
      Generate the content for three files: 'techspec.md', 'plan.md', and 'gemini.md'.

      1.  **techspec.md:** A comprehensive technical specification. Must include:
          - **Project Goal:** A concise summary.
          - **Core Requirements:** A numbered list of specific, testable features.
          - **Non-Goals:** What is explicitly out of scope.
          - **Tech Stack:** Justify the chosen technologies.
          - **Success Criteria:** How to measure project completion.

      2.  **plan.md:** A detailed project plan broken into milestones.
          - Each milestone should have a clear goal.
          - Break down each milestone into specific tasks.
          - Each task must be granular, estimated to take 2-4 hours.
          - For each task, specify implementation details and clear test conditions.
          - Clearly mark dependencies between tasks (e.g., "Depends on: Task #1.3").

      3.  **gemini.md:** A set of system-enforced instructions for the AI coding agent.
          - Must include rules like "Always read techspec.md before implementing," "Follow plan.md strictly," "Write tests before code," and "Commit only on passing tests."
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    techspec: { type: Type.STRING, description: "Content for techspec.md" },
                    plan: { type: Type.STRING, description: "Content for plan.md" },
                    gemini: { type: Type.STRING, description: "Content for gemini.md" },
                },
                required: ["techspec", "plan", "gemini"],
            },
        },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);

    return {
        techspec: parsedJson.techspec || "# Error: Could not generate techspec.md",
        plan: parsedJson.plan || "# Error: Could not generate plan.md",
        gemini: parsedJson.gemini || "# Error: Could not generate gemini.md",
    };
};
