const { fetchTranscript, YoutubeTranscriptNotAvailableLanguageError } = require("youtube-transcript-plus");

const transcriptFetcher = async (req, res) => {
    try {
        const video_id = req.params.videoId || req.body.videoId || req.body.id;

        if (!video_id) {
            return res.status(400).json({ success: false, error: "Video ID is required" });
        }

        let raw = null;
        let lang = "en";

        // Step 1: Try English
        try {
            raw = await fetchTranscript(video_id, { lang: "en" });
        } catch (err) {
            if (err instanceof YoutubeTranscriptNotAvailableLanguageError) {
                // Step 2: English not available — fetch in any available language
                try {
                    raw = await fetchTranscript(video_id);
                    lang = raw?.[0]?.lang || "unknown";
                } catch (err2) {
                    return res.status(404).json({
                        success: false,
                        error: "No transcript available for this video.",
                        details: err2.message,
                    });
                }
            } else {
                // Some other error (disabled, unavailable, etc.)
                return res.status(404).json({
                    success: false,
                    error: "Transcript unavailable for this video.",
                    details: err.message,
                });
            }
        }

        if (!raw || raw.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No transcript available for this video.",
            });
        }

        // Normalize: offset is already in seconds
        const segments = raw.map((item) => ({
            text: item.text,
            start: item.offset,
            duration: item.duration,
        }));

        res.json({
            success: true,
            videoId: video_id,
            lang,
            count: segments.length,
            transcript: segments,
            message: "Transcript fetched successfully",
        });

    } catch (error) {
        console.error("Transcript fetch error:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch transcript",
            details: error.message,
        });
    }
};

module.exports = transcriptFetcher;