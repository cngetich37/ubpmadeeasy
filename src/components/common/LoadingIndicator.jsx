// Small spinner + "Loading..." label shown next to search dropdowns.
const LoadingIndicator = ({ active }) =>
  active ? (
    <div className="flex items-center">
      <div
        className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FFD700] mr-2"
        role="status"
      />
      <span className="text-emerald-900 font-bold ml-1">Loading...</span>
    </div>
  ) : null;

export default LoadingIndicator;
