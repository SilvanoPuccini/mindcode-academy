import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VideoPlayer, VideoPlayerProps, getYouTubeId } from "./VideoPlayer";

describe("VideoPlayer", () => {
  const mockProps: VideoPlayerProps = {
    src: "https://test.com/video.mp4",
    title: "Clase de prueba",
  };

  it("renders the video element", () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByTestId("video-element");
    expect(video).toBeInTheDocument();
  });

  it("renders the correct video source", () => {
    render(<VideoPlayer {...mockProps} />);
    const source = screen.getByTestId("video-element").querySelector("source");
    expect(source).toHaveAttribute("src", mockProps.src);
  });

  it("renders the title as fallback text", () => {
    render(<VideoPlayer {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
  });

  it("fires onEnded when the native video finishes playing", () => {
    const onEnded = vi.fn();
    render(<VideoPlayer {...mockProps} onEnded={onEnded} />);
    const video = screen.getByTestId("video-element");
    video.dispatchEvent(new Event("ended"));
    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});

describe("getYouTubeId", () => {
  it("extracts the id from a watch URL", () => {
    expect(getYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("extracts the id when v= is not the first query param", () => {
    expect(
      getYouTubeId("https://www.youtube.com/watch?si=abc123&v=dQw4w9WgXcQ")
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from youtu.be short links", () => {
    expect(getYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from shorts URLs", () => {
    expect(getYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("returns null for non-YouTube URLs", () => {
    expect(getYouTubeId("https://test.com/video.mp4")).toBeNull();
    expect(getYouTubeId("https://vimeo.com/123456789")).toBeNull();
    expect(getYouTubeId("")).toBeNull();
  });
});

describe("VideoPlayer YouTube support", () => {
  const youTubeProps: VideoPlayerProps = {
    src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Clase con YouTube",
  };

  interface MockPlayerOptions {
    videoId: string;
    host?: string;
    playerVars?: Record<string, unknown>;
    events?: {
      onStateChange?: (event: { data: number; target: unknown }) => void;
    };
  }

  class MockYTPlayer {
    elementId: string;
    options: MockPlayerOptions;
    destroy = vi.fn();

    constructor(elementId: string, options: MockPlayerOptions) {
      this.elementId = elementId;
      this.options = options;
      playerInstances.push(this);
    }
  }

  // Reset before each test so instances don't leak across assertions.
  let playerInstances: MockYTPlayer[];

  beforeEach(() => {
    playerInstances = [];
    window.YT = {
      Player: MockYTPlayer,
      PlayerState: {
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
        UNSTARTED: -1,
      },
    } as unknown as NonNullable<Window["YT"]>;
  });

  afterEach(() => {
    delete window.YT;
  });

  it("renders the YouTube player container instead of a native video", () => {
    render(<VideoPlayer {...youTubeProps} />);
    expect(screen.queryByTestId("video-element")).not.toBeInTheDocument();
    expect(screen.getByTestId("youtube-player-container")).toBeInTheDocument();
  });

  it("instantiates YT.Player with the extracted videoId", async () => {
    render(<VideoPlayer {...youTubeProps} />);
    await waitFor(() => expect(playerInstances).toHaveLength(1));
    expect(playerInstances[0].options.videoId).toBe("dQw4w9WgXcQ");
  });

  it("also detects youtu.be and shorts links as embeddable", async () => {
    const { unmount } = render(
      <VideoPlayer src="https://youtu.be/dQw4w9WgXcQ" title="Corta" />
    );
    await waitFor(() => expect(playerInstances).toHaveLength(1));
    expect(playerInstances[0].options.videoId).toBe("dQw4w9WgXcQ");
    unmount();

    render(
      <VideoPlayer
        src="https://www.youtube.com/shorts/dQw4w9WgXcQ"
        title="Short"
      />
    );
    await waitFor(() => expect(playerInstances).toHaveLength(2));
    expect(playerInstances[1].options.videoId).toBe("dQw4w9WgXcQ");
  });

  it("calls onEnded when the player reports the ENDED state", async () => {
    const onEnded = vi.fn();
    render(<VideoPlayer {...youTubeProps} onEnded={onEnded} />);
    await waitFor(() => expect(playerInstances).toHaveLength(1));

    const onStateChange = playerInstances[0].options.events?.onStateChange;
    onStateChange?.({ data: window.YT!.PlayerState.ENDED, target: playerInstances[0] });

    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("does not call onEnded for non-ENDED state changes", async () => {
    const onEnded = vi.fn();
    render(<VideoPlayer {...youTubeProps} onEnded={onEnded} />);
    await waitFor(() => expect(playerInstances).toHaveLength(1));

    const onStateChange = playerInstances[0].options.events?.onStateChange;
    onStateChange?.({ data: window.YT!.PlayerState.PLAYING, target: playerInstances[0] });

    expect(onEnded).not.toHaveBeenCalled();
  });

  it("destroys the player on unmount", async () => {
    const { unmount } = render(<VideoPlayer {...youTubeProps} />);
    await waitFor(() => expect(playerInstances).toHaveLength(1));
    unmount();
    expect(playerInstances[0].destroy).toHaveBeenCalledTimes(1);
  });
});
