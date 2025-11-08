
import React, { useState } from 'react';
import { GeneratedDocs } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileTextIcon } from './icons/FileTextIcon';

// This is a simplified in-memory markdown renderer.
// For a full experience, a library like react-markdown is recommended.
const SimpleMarkdownViewer: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none p-4 bg-gray-900 rounded-b-lg whitespace-pre-wrap">
            <pre className="whitespace-pre-wrap font-sans">{content}</pre>
        </div>
    );
};


interface Step3DocumentsProps {
  docs: GeneratedDocs;
  onRestart: () => void;
}

type DocKey = keyof GeneratedDocs;

const Step3Documents: React.FC<Step3DocumentsProps> = ({ docs, onRestart }) => {
  const [activeTab, setActiveTab] = useState<DocKey>('techspec');

  const handleDownload = () => {
    // @ts-ignore - JSZip is loaded from CDN
    const zip = new JSZip();
    zip.file("techspec.md", docs.techspec);
    zip.file("plan.md", docs.plan);
    zip.file("gemini.md", docs.gemini);
    zip.generateAsync({ type: "blob" }).then(function(content) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "vibe-prd-docs.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const tabs: { key: DocKey; label: string }[] = [
    { key: 'techspec', label: 'techspec.md' },
    { key: 'plan', label: 'plan.md' },
    { key: 'gemini', label: 'gemini.md' },
  ];

  return (
    <div className="w-full flex-grow flex flex-col bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
            <FileTextIcon className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Generated Documents</h2>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <DownloadIcon />
                Download .zip
            </button>
            <button
                onClick={onRestart}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Start New Project
            </button>
        </div>
      </div>
      
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <SimpleMarkdownViewer content={docs[activeTab]} />
      </div>
    </div>
  );
};

export default Step3Documents;
