import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("renders an iframe instead of a native video", () => {
    render(<VideoPlayer {...youTubeProps} />);
    expect(screen.queryByTestId("video-element")).not.toBeInTheDocument();
    expect(screen.getByTitle("Clase con YouTube").tagName).toBe("IFRAME");
  });

  it("embeds the privacy-enhanced youtube-nocookie player", () => {
    render(<VideoPlayer {...youTubeProps} />);
    const iframe = screen.getByTitle("Clase con YouTube");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(iframe).toHaveAttribute("allowfullscreen");
  });

  it("also detects youtu.be and shorts links as embeddable", () => {
    const { unmount } = render(
      <VideoPlayer src="https://youtu.be/dQw4w9WgXcQ" title="Corta" />
    );
    expect(screen.getByTitle("Corta").tagName).toBe("IFRAME");
    unmount();

    render(
      <VideoPlayer
        src="https://www.youtube.com/shorts/dQw4w9WgXcQ"
        title="Short"
      />
    );
    expect(screen.getByTitle("Short").tagName).toBe("IFRAME");
  });
});
