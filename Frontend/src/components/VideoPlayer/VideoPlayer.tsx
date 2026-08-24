import { FC } from "react";
import styles from "./VideoPlayer.module.scss";

export interface VideoPlayerProps {
  src: string;
  title: string;
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

export const VideoPlayer: FC<VideoPlayerProps> = ({ src, title }) => {
  const youTubeId = getYouTubeId(src);

  // Native <video> cannot play YouTube URLs: embed the
  // privacy-enhanced nocookie player instead, inside an
  // aspect-ratio wrapper so it keeps the same card look.
  if (youTubeId) {
    return (
      <div className={styles.videoPlayer}>
        <div className={styles.youTubeWrapper}>
          <iframe
            className={styles.youTubeEmbed}
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.videoPlayer}>
      <video controls className={styles.video} data-testid="video-element">
        <source src={src} type="video/mp4" />
        {title}
      </video>
    </div>
  );
};
