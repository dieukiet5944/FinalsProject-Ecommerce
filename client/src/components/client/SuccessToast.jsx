// Simple success toast notification
const SuccessToast = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg animate-bounce z-50">
      <div className="flex items-center gap-3">
        <span className="text-xl">✓</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default SuccessToast;
