import { FC, useEffect, useId, useRef } from "react";
import styles from "./VideoPlayer.module.scss";

export interface VideoPlayerProps {
  src: string;
  title: string;
  /** Fires once when playback reaches the end (YouTube ENDED state or native <video> onEnded). */
  onEnded?: () => void;
}

/**
 * Extracts the video id from the three public YouTube URL shapes:
 * - https://www.youtube.com/watch?v=<id>(&other params)
 * - https://youtu.be/<id>
 * - https://www.youtube.com/shorts/<id>
 * Returns null for any other URL (e.g. plain MP4 files).
 */
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) return match[1];
  }

  return null;
}

// ---- Minimal YouTube IFrame Player API typings (no @types/youtube dep) ----

interface YTPlayerEvent {
  data: number;
  target: YTPlayer;
}

interface YTPlayer {
  destroy: () => void;
}

interface YTPlayerVars {
  origin?: string;
  [key: string]: unknown;
}

interface YTPlayerOptions {
  videoId: string;
  host?: string;
  playerVars?: YTPlayerVars;
  events?: {
    onStateChange?: (event: YTPlayerEvent) => void;
    onReady?: (event: YTPlayerEvent) => void;
  };
}

interface YTNamespace {
  Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
    UNSTARTED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Singleton loader: the YouTube IFrame API script must only be injected
// once per page, and every VideoPlayer instance awaits the same promise.
let youTubeApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API requires a browser environment"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youTubeApiPromise) return youTubeApiPromise;

  youTubeApiPromise = new Promise<YTNamespace>((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT as YTNamespace);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youTubeApiPromise;
}

function YouTubePlayer({
  youTubeId,
  title,
  onEnded,
}: {
  youTubeId: string;
  title: string;
  onEnded?: () => void;
}) {
  const containerId = `yt-player-${useId().replace(/:/g, "")}`;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(containerId, {
        videoId: youTubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: { origin: window.location.origin },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [containerId, youTubeId]);

  return (
    <div className={styles.youTubeWrapper}>
      <div
        id={containerId}
        className={styles.youTubeEmbed}
        data-testid="youtube-player-container"
        role="img"
        aria-label={title}
      />
    </div>
  );
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ src, title, onEnded }) => {
  const youTubeId = getYouTubeId(src);

  // Native <video> cannot play YouTube URLs: embed the
  // privacy-enhanced nocookie player instead, inside an
  // aspect-ratio wrapper so it keeps the same card look.
  if (youTubeId) {
    return (
      <div className={styles.videoPlayer}>
        <YouTubePlayer youTubeId={youTubeId} title={title} onEnded={onEnded} />
      </div>
    );
  }

  return (
    <div className={styles.videoPlayer}>
      <video
        controls
        className={styles.video}
        data-testid="video-element"
        onEnded={onEnded}
      >
        <source src={src} type="video/mp4" />
        {title}
      </video>
    </div>
  );
};
