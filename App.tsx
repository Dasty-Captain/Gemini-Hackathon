
import React, { useState, useCallback } from 'react';
import { ProjectDetails, ChatMessage, GeneratedDocs, AppStep } from './types';
import { initialProjectDetails } from './constants';
import { generateDocuments } from './services/geminiService';
import Step1InitialForm from './components/Step1_InitialForm';
import Step2Conversation from './components/Step2_Conversation';
import Step3Documents from './components/Step3_Documents';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { Loader } from './components/ui/Loader';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.InitialForm);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(initialProjectDetails);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (details: ProjectDetails) => {
    setProjectDetails(details);
    setStep(AppStep.Conversation);
  };
  
  const handleConversationFinish = useCallback(async (history: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);
    setChatHistory(history);
    try {
      const docs = await generateDocuments(projectDetails, history);
      setGeneratedDocs(docs);
      setStep(AppStep.Documents);
    } catch (e) {
      console.error(e);
      setError('Failed to generate documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [projectDetails]);

  const handleRestart = () => {
    setStep(AppStep.InitialForm);
    setProjectDetails(initialProjectDetails);
    setChatHistory([]);
    setGeneratedDocs(null);
    setError(null);
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <Loader />
          <h2 className="text-2xl font-bold text-gray-200 mt-6">Generating Your Documents...</h2>
          <p className="text-gray-400 mt-2">The AI is cross-validating requirements and decomposing tasks.</p>
          <p className="text-gray-400">This might take a moment.</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <h2 className="text-2xl font-bold text-red-400">An Error Occurred</h2>
            <p className="text-gray-400 mt-2">{error}</p>
            <button
                onClick={handleRestart}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Start Over
            </button>
        </div>
       );
    }
    
    switch (step) {
      case AppStep.InitialForm:
        return <Step1InitialForm onFormSubmit={handleFormSubmit} />;
      case AppStep.Conversation:
        return <Step2Conversation projectDetails={projectDetails} onConversationFinish={handleConversationFinish} />;
      case AppStep.Documents:
        return generatedDocs ? <Step3Documents docs={generatedDocs} onRestart={handleRestart} /> : null;
      default:
        return <Step1InitialForm onFormSubmit={handleFormSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-full px-4 py-2">
            <SparklesIcon className="h-6 w-6 text-indigo-400"/>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
              Vibe PRD Generator
            </h1>
          </div>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Transform vague ideas into production-ready PRDs through an AI-powered conversation.
        </p>
      </header>
      <main className="w-full max-w-4xl flex-grow flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
