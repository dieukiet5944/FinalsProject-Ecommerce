// Simple loading spinner component
const LoadingSpinner = () => {
  return (
    <div className="py-20 text-center">
      <div className="inline-block">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500"></div>
      </div>
      <p className="text-light-text-secondary text-lg mt-4">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
