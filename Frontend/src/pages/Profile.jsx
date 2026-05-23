import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import historyService from "../services/historyService";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      historyService.getHistory()
        .then(data => {
            if (data.success) {
                setHistory(data.history);
            }
        })
        .catch(console.error)
        .finally(() => setIsLoadingHistory(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-xl">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleResumeSession = (session) => {
    if (session.type === 'video') {
        navigate('/learning', { state: { session } });
    } else {
        navigate('/mentor');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 px-6 pb-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 gap-6">
            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-5xl font-bold text-indigo-600 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {user.email}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Learning History */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning History</h2>
          </div>
          
          {isLoadingHistory ? (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <span className="text-4xl mb-4 block">📚</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No learning history yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Start watching a video or talk to your mentor to save your progress here.</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/learning')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-md">
                    Start Learning
                </button>
                <button onClick={() => navigate('/mentor')} className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm">
                    Talk to Mentor
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {history.map((record, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={record._id}
                        onClick={() => handleResumeSession(record)}
                        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
                    >
                        {record.type === 'video' ? (
                            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                <img 
                                    src={`https://img.youtube.com/vi/${record.videoId}/mqdefault.jpg`} 
                                    alt="Thumbnail" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1">
                                    <span>▶</span> Video
                                </div>
                            </div>
                        ) : (
                            <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center">
                                <span className="text-4xl text-white opacity-80 group-hover:scale-110 transition-transform duration-500">🧑‍🏫</span>
                                <div className="absolute bottom-2 right-2 bg-black/40 px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1">
                                    <span>💬</span> AI Mentor
                                </div>
                            </div>
                        )}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {record.videoTitle}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                                {new Date(record.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            
                            <div className="flex gap-2 text-xs">
                                {record.notes && <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">Notes Saved</span>}
                                {record.chatHistory && record.chatHistory.length > 0 && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded font-medium">{record.chatHistory.length} Msgs</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
