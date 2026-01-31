import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'info'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-stone-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-stone-100 dark:border-stone-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-[#F2A600]'
                        }`}>
                        <span className="material-symbols-outlined text-3xl">
                            {variant === 'danger' ? 'logout' : 'help'}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#221C1D] dark:text-white mb-2 uppercase tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 px-4 leading-relaxed">
                        {message}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onCancel}
                            className="py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all border border-stone-100"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${variant === 'danger' ? 'bg-red-600 shadow-red-200' : 'bg-[#221C1D] shadow-stone-200'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
