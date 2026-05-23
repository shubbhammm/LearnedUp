import { useState, useEffect, useRef, useCallback } from "react";
import { fetchYouTubeTranscript } from "../services/transcript";
import LearningRight from "../components/learningRight";
import AIService from "../services/aiService";
import html2pdf from "html2pdf.js";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import historyService from "../services/historyService";

// Helper: truncate label to first 8 words
const truncateLabel = (text) => {
  const words = text.split(' ');
  return words.length > 8 ? words.slice(0, 8).join(' ') + '…' : text;
};

// Helper: chunk transcript into groups of `size`
const chunkTranscript = (segments, size = 12) => {
  const groups = [];
  for (let i = 0; i < segments.length; i += size) groups.push(segments.slice(i, i + size));
  return groups;
};

const Learningpage = () => {
  const [link, setLink] = useState("");
  const [submittedLink, setSubmittedLink] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState("");
  const [videoId, setVideoId] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [openGroups, setOpenGroups] = useState({});

  // Notes state
  const [notes, setNotes] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");

  // PDF state
  const [isPDFGenerating, setIsPDFGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  
  // Refs
  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const transcriptPanelRef = useRef(null);
  const transcriptDataRef = useRef([]);
  const progressInterval = useRef(null);
  const playerContainerRef = useRef(null);
  const notesContainerRef = useRef(null);
  const aiService = new AIService();

  useEffect(() => {
    transcriptDataRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (window.YT && window.YT.Player) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.body.appendChild(tag);
  }, []);

  const initPlayer = useCallback(() => {
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    }
    playerReadyRef.current = false;
    clearInterval(progressInterval.current);

    if (!document.getElementById("yt-player")) return;

    playerRef.current = new window.YT.Player("yt-player", {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          playerReadyRef.current = true;
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            clearInterval(progressInterval.current);
            progressInterval.current = setInterval(() => {
              if (!playerRef.current?.getCurrentTime) return;
              const cTime = playerRef.current.getCurrentTime();
              setCurrentTime(cTime);
              
              const segments = transcriptDataRef.current;
              let idx = -1;
              for (let i = 0; i < segments.length; i++) {
                if (segments[i].start <= cTime) idx = i;
                else break;
              }
              setActiveIndex(idx);
              
              if (idx >= 0 && transcriptPanelRef.current) {
                // The user explicitly requested to NOT scroll the page with transcript changes
                // const el = transcriptPanelRef.current.querySelector(`[data-idx="${idx}"]`);
                // if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }
            }, 500);
          } else {
            clearInterval(progressInterval.current);
          }
        },
      },
    });
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    const tryInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }
    };
    const timer = setTimeout(tryInit, 50);
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval.current);
    };
  }, [videoId, initPlayer]);

  const seekTo = useCallback((seconds) => {
    if (playerReadyRef.current && playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  const location = useLocation();

  // Load from location state if we are coming from the Profile History
  useEffect(() => {
    if (location.state?.session) {
      const s = location.state.session;
      setSubmittedLink(s.videoLink || `https://www.youtube.com/embed/${s.videoId}`);
      setVideoId(s.videoId);
      setLink(s.videoLink || `https://youtube.com/watch?v=${s.videoId}`);
      setNotes(s.notes || "");
      setIsLoadingTranscript(true);
      fetchYouTubeTranscript(s.videoId).then(data => {
        if (data.success && data.transcript?.length > 0) setTranscript(data.transcript);
        else setTranscriptError("No transcript available.");
      }).catch(e => setTranscriptError(e.message)).finally(() => setIsLoadingTranscript(false));
    }
  }, [location.state]);

  // Optionally, when notes change, save to DB
  useEffect(() => {
    if (submittedLink && videoId) {
      historyService.saveSession({
        type: 'video',
        videoId: videoId,
        videoLink: link || submittedLink,
        notes: notes
      }).catch(console.error);
    }
  }, [notes, submittedLink]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const clearSavedData = () => {
    try { if (playerRef.current) playerRef.current.destroy(); } catch { /* ignore */ }
    playerReadyRef.current = false;
    clearInterval(progressInterval.current);
    localStorage.removeItem("learningPageData");
    setSubmittedLink(""); setTranscript([]); setVideoId("");
    setLink(""); setTranscriptError(""); setActiveIndex(-1);
    setNotes(""); setCurrentTime(0);
  };

  const handleChange = (e) => setLink(e.target.value);

  const extractVideoId = (url) => {
    if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
    if (url.includes("m.youtube.com/watch?v=")) return url.split("watch?v=")[1].split("&")[0];
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) { alert("❌ Please paste a valid link!"); return; }

    const extractedVideoId = extractVideoId(link);
    if (!extractedVideoId) { alert("⚠️ Please paste a valid YouTube video link!"); return; }

    const embedLink = `https://www.youtube.com/embed/${extractedVideoId}`;
    setSubmittedLink(embedLink);
    setVideoId(extractedVideoId);
    setIsLoadingTranscript(true);
    setTranscriptError("");
    setTranscript([]);
    setActiveIndex(-1);
    setNotes("");

    try {
      const data = await fetchYouTubeTranscript(extractedVideoId);
      if (data.success && Array.isArray(data.transcript) && data.transcript.length > 0) {
        setTranscript(data.transcript);
      } else {
        setTranscriptError("No transcript available for this video.");
      }
    } catch (error) {
      setTranscriptError("Failed to load transcript: " + error.message);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const generateNotes = async () => {
    if (!transcript.length) return;
    setIsGeneratingNotes(true);
    setNotesError("");
    try {
      // Create a massive string but cap it at around 80,000 characters to prevent 
      // Gemini from rejecting the payload and throwing a 500 error for extreme videos.
      let fullText = transcript.map((item) => item.text).join(' ');
      if (fullText.length > 80000) {
        fullText = fullText.substring(0, 80000) + "... [transcript truncated due to length]";
      }
      
      const response = await aiService.analyzeTranscript(fullText, "summary");
      if (response.success) {
        setNotes(response.analysis);
      } else {
        setNotesError("Failed to generate notes. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setNotesError("An error occurred while generating notes.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const downloadPDF = async () => {
    if (!notes) return;
    setIsPDFGenerating(true);
    setPdfError("");
    try {
      // Convert markdown to simple HTML directly from notes state — no DOM query needed
      const mdToHtml = (md) =>
        md
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/\n/g, '<br/>');

      const htmlContent = `
        <div style="width:100%;box-sizing:border-box;background-color:#ffffff;color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:20px;">
          <div style="border-bottom:2px solid #e5e7eb;margin-bottom:20px;padding-bottom:10px;">
            <h1 style="color:#4f46e5;margin:0 0 5px 0;font-size:24px;">LearnedUp AI Notes</h1>
            <p style="color:#6b7280;margin:0;font-size:12px;">Generated for video: ${videoId}</p>
          </div>
          <div style="font-size:14px;line-height:1.6;color:#1f2937;">
            ${mdToHtml(notes)}
          </div>
        </div>
      `;

      const opt = {
        margin:       15,
        filename:     `LearnedUp-Notes-${videoId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(htmlContent).set(opt).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
      setPdfError("Failed to export PDF. Please try again.");
    } finally {
      setIsPDFGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {!submittedLink ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4"
        >
          <div className="text-center space-y-6 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Enter the Learning <span className="text-indigo-600 dark:text-indigo-400">Zone</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Paste your YouTube link below to unlock AI-powered transcripts, contextual chat, and beautiful PDF notes.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto w-full">
              <input
                onChange={handleChange}
                value={link}
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full sm:flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-0 text-lg shadow-sm transition-colors outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all"
              >
                Analyze Video
              </motion.button>
            </form>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] overflow-y-auto lg:overflow-hidden">
          {/* Main Content Area */}
          <div className="w-full lg:w-[75%] lg:h-full flex flex-col overflow-y-visible lg:overflow-y-auto pb-10 lg:pb-0">
            {/* Video Player */}
            <div ref={playerContainerRef} className="w-full aspect-video bg-black shrink-0 relative shadow-2xl z-10">
              <div id="yt-player" className="w-full h-full absolute inset-0" />
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="text-indigo-600 dark:text-indigo-400">⚡</span> Video Workspace
                </h2>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearSavedData} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors">
                    Reset Session
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateNotes}
                    disabled={isGeneratingNotes || transcript.length === 0}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    {isGeneratingNotes ? "Generating..." : "Generate AI Notes"}
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">Video Timestamps</h3>
                  </div>
                  
                  {isLoadingTranscript ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : transcriptError ? (
                    <div className="p-4 text-red-500">{transcriptError}</div>
                  ) : transcript.length > 0 ? (
                    <div ref={transcriptPanelRef} className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-2 content-start">
                      {transcript.length <= 12 ? (
                        // Short transcript: flat list, no grouping
                        transcript.map((item, index) => (
                          <button
                            key={index}
                            data-idx={index}
                            onClick={() => seekTo(item.start)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all border flex flex-col items-start ${
                              index === activeIndex
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span>{formatTime(item.start)}</span>
                            <span className="text-xs font-sans font-normal opacity-75 text-left">{truncateLabel(item.text)}</span>
                          </button>
                        ))
                      ) : (
                        // Long transcript: collapsible groups
                        chunkTranscript(transcript).map((group, groupIndex) => {
                          const isOpen = openGroups[groupIndex] !== false; // default open
                          const headerLabel = `${formatTime(group[0].start)} – ${formatTime(group[group.length - 1].start)}`;
                          return (
                            <div key={groupIndex} className="w-full">
                              <button
                                onClick={() => setOpenGroups(prev => ({ ...prev, [groupIndex]: !isOpen }))}
                                className="w-full flex items-center justify-between px-3 py-2 mb-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <span>{headerLabel}</span>
                                <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
                              </button>
                              {isOpen && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {group.map((item) => {
                                    const globalIndex = transcript.indexOf(item);
                                    return (
                                      <button
                                        key={globalIndex}
                                        data-idx={globalIndex}
                                        onClick={() => seekTo(item.start)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all border flex flex-col items-start ${
                                          globalIndex === activeIndex
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                      >
                                        <span>{formatTime(item.start)}</span>
                                        <span className="text-xs font-sans font-normal opacity-75 text-left">{truncateLabel(item.text)}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                      <p>No timestamps available for this video.</p>
                    </div>
                  )}
                </div>

                {/* Notes Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 shrink-0 flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 dark:text-white">AI Notes</h3>
                    {notes && (
                      <div className="flex flex-col items-end gap-1">
                        <button 
                          onClick={downloadPDF}
                          disabled={isPDFGenerating}
                          className="text-xs px-3 py-1.5 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-lg font-medium transition-colors"
                        >
                          {isPDFGenerating ? "Generating PDF…" : "↓ Download PDF"}
                        </button>
                        {pdfError && (
                          <p className="text-xs text-red-500 dark:text-red-400">{pdfError}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
                    {notes ? (
                      <div ref={notesContainerRef} className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400">
                        {/* Title strictly for PDF but looks good here too */}
                        <div className="border-b-2 border-indigo-100 dark:border-indigo-900 pb-4 mb-4">
                          <h1 className="text-2xl font-black mb-1">LearnedUp AI Notes</h1>
                          <p className="text-gray-500 text-sm">Generated for video: {videoId}</p>
                        </div>
                        <div className="md-content">
                          <ReactMarkdown>{notes}</ReactMarkdown>
                        </div>
                      </div>
                    ) : notesError ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <p className="text-red-500 dark:text-red-400">{notesError}</p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                        <p>Click "Generate AI Notes" to create a structured, downloadable summary.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot Area Sidebar */}
          <div className="w-full lg:w-[25%] h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-20">
            <LearningRight 
              contextData={{ 
                transcript: transcript, 
                currentTime: currentTime 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Learningpage;
