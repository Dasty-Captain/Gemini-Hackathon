
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectDetails, ChatMessage, ChatRole } from '../types';
import { startConversation, continueConversation } from '../services/geminiService';
import { Chat } from '@google/genai';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';

interface Step2ConversationProps {
  projectDetails: ProjectDetails;
  onConversationFinish: (history: ChatMessage[]) => void;
}

const Step2Conversation: React.FC<Step2ConversationProps> = ({ projectDetails, onConversationFinish }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);

  const initializeChat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { chat: newChat, firstMessage } = await startConversation(projectDetails);
      setChat(newChat);
      setHistory([{ role: ChatRole.MODEL, text: firstMessage }]);
    } catch (e) {
      console.error(e);
      setError('Failed to start conversation with the AI. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetails]);

  useEffect(() => {
    initializeChat();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const newUserMessage: ChatMessage = { role: ChatRole.USER, text: userInput };
    setHistory(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const modelResponse = await continueConversation(chat, userInput);
      const newModelMessage: ChatMessage = { role: ChatRole.MODEL, text: modelResponse };
      setHistory(prev => [...prev, newModelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { role: ChatRole.MODEL, text: "Sorry, I encountered an error. Please try again." };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const canFinish = history.length >= 5; // Enable after a few exchanges

  return (
    <div className="w-full flex-grow flex flex-col bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === ChatRole.USER ? 'justify-end' : ''}`}>
              {msg.role === ChatRole.MODEL && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <BotIcon />
                </div>
              )}
              <div className={`max-w-md p-3 rounded-lg ${msg.role === ChatRole.MODEL ? 'bg-gray-700' : 'bg-purple-600'}`}>
                <p className="text-white whitespace-pre-wrap">{msg.text}</p>
              </div>
               {msg.role === ChatRole.USER && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <UserIcon />
                </div>
              )}
            </div>
          ))}
          {isLoading && history.length > 0 && (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <BotIcon />
                </div>
                <div className="max-w-md p-3 rounded-lg bg-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.4s'}}></div>
                </div>
             </div>
          )}
          {error && <p className="text-red-400 text-center">{error}</p>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-gray-900/50 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-grow bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-lg transition-colors disabled:bg-gray-600"
            disabled={isLoading || !userInput.trim()}
          >
            Send
          </button>
        </form>
         <div className="mt-4 text-center">
             <button
                onClick={() => onConversationFinish(history)}
                disabled={!canFinish || isLoading}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
               Generate Documents
              </button>
              <p className="text-xs text-gray-500 mt-1">
                {canFinish ? 'Ready to generate?' : 'Have at least 2-3 back-and-forths for best results.'}
              </p>
         </div>
      </div>
    </div>
  );
};

export default Step2Conversation;
