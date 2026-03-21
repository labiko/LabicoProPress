export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', variant = 'danger' }) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'from-red-500 to-red-600 shadow-red-500/20',
    warning: 'from-orange-500 to-orange-600 shadow-orange-500/20',
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-orange-100' : 'bg-primary-100'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${
              variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-orange-600' : 'text-primary-600'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 px-4 bg-gradient-to-r ${variantStyles[variant]} text-white rounded-lg text-sm font-medium transition-all shadow-md`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
