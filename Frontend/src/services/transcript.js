// YouTube transcript service
const fetchYouTubeTranscript = async (videoId) => {
  try {
    // Use your backend API to fetch transcript
    const response = await fetch(`http://localhost:4500/api/video/transcript/${videoId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

// Extract video ID from YouTube URL
const extractVideoId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  let videoId = null;
  
  if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("m.youtube.com/watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  } else if (url.includes("/embed/")) {
    videoId = url.split("/embed/")[1].split("?")[0];
  }
  
  return videoId;
};

export { fetchYouTubeTranscript, extractVideoId };