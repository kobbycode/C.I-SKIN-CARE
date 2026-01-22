
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const QUESTIONS = [
    {
        id: 1,
        question: "What is your primary skin concern?",
        options: [
            { label: "Aging & Fine Lines", icon: "stipple", value: "Aging" },
            { label: "Dullness & Uneven Tone", icon: "flare", value: "Dullness" },
            { label: "Acne & Blemishes", icon: "emergency", value: "Oily & Acne-Prone" },
            { label: "Dryness & Dehydration", icon: "water_drop", value: "Dryness" },
        ]
    },
    {
        id: 2,
        question: "How would you describe your skin type?",
        options: [
            { label: "Dry & Tight", value: "Dry & Dehydrated" },
            { label: "Oily & Shiny", value: "Oily & Acne-Prone" },
            { label: "Combination", value: "All Skin Types" },
            { label: "Sensitive & Reactive", value: "Sensitive" },
        ]
    },
    {
        id: 3,
        question: "What is your primary goal?",
        options: [
            { label: "Instant Radiance", value: "Dullness" },
            { label: "Deep Hydration", value: "Dehydration" },
            { label: "Intensive Repair", value: "Treatments" },
            { label: "Anti-Redness", value: "Redness" },
        ]
    }
];

const SkinQuiz: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const navigate = useNavigate();

    const handleSelect = (value: string) => {
        const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: value };
        setAnswers(newAnswers);

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Results logic - simple for now: redirect to shop with the most prominent concern
            const mostProminent = newAnswers[1];
            navigate(`/shop?q=${mostProminent.toLowerCase()}`);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-24 bg-background-light dark:bg-background-dark px-6">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-16">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Step {currentStep + 1} of {QUESTIONS.length}</span>
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40">The Analysis Ritual</span>
                    </div>
                    <div className="h-px w-full bg-primary/10 relative">
                        <motion.div
                            className="absolute top-0 left-0 h-px bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-center"
                    >
                        <h2 className="font-display text-3xl md:text-5xl mb-12 text-secondary dark:text-white leading-tight">
                            {QUESTIONS[currentStep].question}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {QUESTIONS[currentStep].options.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleSelect(opt.value)}
                                    className="group relative p-8 border border-primary/10 bg-white dark:bg-stone-900 rounded-2xl hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center text-center"
                                >
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors" />
                                    {opt.icon && (
                                        <span className="material-symbols-outlined text-primary text-4xl mb-4 font-light opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                            {opt.icon}
                                        </span>
                                    )}
                                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-secondary dark:text-white group-hover:text-primary transition-colors">
                                        {opt.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="mt-12 text-[10px] uppercase tracking-[0.4em] font-bold text-primary/40 hover:text-primary transition-colors inline-flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">west</span>
                                Previous Step
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Decorative Branding */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
                <img src="/logo.jpg" alt="" className="h-20 grayscale" />
            </div>
        </main>
    );
};

export default SkinQuiz;
