'use client';

import { motion, AnimatePresence } from 'framer-motion';

export const StepWizard = ({ steps, currentStep, onStepClick, children }) => {
    return (
        <div className="w-full">
            {/* Simple Clean Steps */}
            <div className="mb-12 relative">
                <div className="flex items-center justify-center max-w-3xl mx-auto">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.number;
                        const isCurrent = currentStep === step.number;
                        const isClickable = step.number <= currentStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={step.number} className="flex items-center">
                                {/* Step Circle */}
                                <div
                                    className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    onClick={() => isClickable && onStepClick && onStepClick(step.number)}
                                >
                                    <motion.div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-3 font-bold text-lg transition-all duration-300 ${
                                            isCurrent
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : isCompleted
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-transparent border-gray-600 text-gray-500'
                                        }`}
                                        whileHover={isClickable ? { scale: 1.05 } : {}}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {step.number}
                                    </motion.div>
                                    
                                    {/* Step Label */}
                                    <span
                                        className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                                            isCurrent || isCompleted ? 'text-white' : 'text-gray-500'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>

                                {/* Connector Line */}
                                {!isLast && (
                                    <div className="w-24 h-1 mx-6 mb-8 relative">
                                        <div className="absolute inset-0 bg-gray-700 rounded-full" />
                                        <motion.div
                                            className="absolute inset-0 bg-indigo-600 rounded-full"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: isCompleted ? 1 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ transformOrigin: 'left' }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
