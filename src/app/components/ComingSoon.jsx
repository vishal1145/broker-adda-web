'use client';

const ComingSoon = ({ 
  title = "Coming Soon", 
  description = "This feature is under development. Stay tuned!",
  icon = "🚀"
}) => {
  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        {/* <div className="text-8xl mb-8 animate-bounce">
          {icon}
        </div> */}

        {/* Coming Soon Badge */}
        <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
          🚀 COMING SOON
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Development in Progress</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
