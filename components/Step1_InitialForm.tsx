
import React, { useState, FormEvent } from 'react';
import { ProjectDetails } from '../types';
import { initialProjectDetails } from '../constants';
import { PencilIcon } from './icons/PencilIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface Step1InitialFormProps {
  onFormSubmit: (details: ProjectDetails) => void;
}

const formSteps = [
  { id: 'idea', label: 'What\'s your project idea?', placeholder: 'e.g., "A WhatsApp clone"' },
  { id: 'projectType', label: 'What type of project is it?', options: ['Web App', 'Mobile App', 'API', 'Chrome Extension', 'Other'] },
  { id: 'audience', label: 'Who is the target audience?', placeholder: 'e.g., "Students and educators"' },
  { id: 'goal', label: 'What is the key goal in one sentence?', placeholder: 'e.g., "To allow users to communicate in real-time"' },
  { id: 'techStack', label: 'Any preferred tech stack? (Optional)', placeholder: 'e.g., "React with Firebase"' },
];

const Step1InitialForm: React.FC<Step1InitialFormProps> = ({ onFormSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [details, setDetails] = useState<ProjectDetails>(initialProjectDetails);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFormSubmit(details);
    }
  };

  const { id, label, placeholder, options } = formSteps[currentStep];
  const value = details[id as keyof ProjectDetails];

  return (
    <div className="w-full flex-grow flex items-center justify-center">
      <div className="w-full max-w-2xl p-4">
        <form onSubmit={handleNextStep} className="flex items-center gap-4">
            <span className="flex-shrink-0 text-indigo-400 h-8 w-8">
                <PencilIcon />
            </span>
            <div className="flex-grow">
                <label htmlFor={id} className="text-xl md:text-2xl font-medium text-gray-300 mb-2 block">{label}</label>
                {options ? (
                    <select
                        id={id}
                        name={id}
                        value={value}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-xl md:text-2xl text-white border-b-2 border-gray-600 focus:border-indigo-500 focus:outline-none py-2 transition-colors"
                    >
                        {options.map(opt => <option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type="text"
                        id={id}
                        name={id}
                        value={value}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        required={id !== 'techStack'}
                        autoComplete="off"
                        className="w-full bg-transparent text-xl md:text-2xl text-white border-b-2 border-gray-600 focus:border-indigo-500 focus:outline-none py-2 transition-colors placeholder-gray-500"
                        autoFocus
                    />
                )}
            </div>
            <button
                type="submit"
                className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 rounded-full p-3 text-white transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                disabled={id !== 'techStack' && !value}
            >
                <ChevronRightIcon />
            </button>
        </form>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-8">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Step1InitialForm;
