import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ComponentProps } from "react";
import { Course } from "../Course";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: ComponentProps<"img">) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock contexts
vi.mock("@/contexts/CourseContext", () => ({
  useCourses: () => ({
    favorites: [],
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe("Course Component", () => {
  const mockCourse = {
    id: 1,
    name: "React Fundamentals",
    description: "Learn React from scratch",
    thumbnail: "https://example.com/thumbnail.jpg",
    average_rating: 4.5,
    total_ratings: 100,
  };

  it("renders course name correctly", () => {
    render(<Course {...mockCourse} />);

    expect(screen.getByText(mockCourse.name)).toBeDefined();
  });

  it("renders thumbnail with correct alt text", () => {
    render(<Course {...mockCourse} />);

    // Scope by accessible name: StarRating also exposes an img role via its aria-label
    const thumbnail = screen.getByRole("img", { name: mockCourse.name });
    expect(thumbnail).toHaveAttribute("alt", mockCourse.name);
  });

  it("renders with correct structure", () => {
    const { container } = render(<Course {...mockCourse} />);

    // Card anatomy: article wrapper + h2 title
    expect(container.querySelector("article")).toBeDefined();
    expect(container.querySelector("h2")).toBeDefined();
  });

  it("shows the inferred taxonomy category as a thumb badge", () => {
    const { container } = render(<Course {...mockCourse} />);

    const badge = container.querySelector("[class*='categoryBadge']");
    expect(badge).toBeDefined();
    // inferCategory maps anything matching /react|next.js/ to 'React'
    expect(badge).toHaveTextContent("React");
  });

  it("renders rating average and count in the meta row", () => {
    const { container } = render(<Course {...mockCourse} />);

    const metaRow = container.querySelector("[class*='metaRow']");
    expect(metaRow).toBeDefined();
    // StarRating exposes "(100)" for total_ratings via showCount
    expect(metaRow).toHaveTextContent("(100)");
  });

  it("renders class count and duration when classes are hydrated", () => {
    const hydrated = {
      ...mockCourse,
      classes: [
        { id: 1, name: "Intro", description: "...", slug: "intro", duration: 90 },
        { id: 2, name: "Estado", description: "...", slug: "estado", duration: 30 },
      ],
    };
    const { container } = render(<Course {...hydrated} />);

    const metaRow = container.querySelector("[class*='metaRow']");
    expect(metaRow).toHaveTextContent("2 clases");
    expect(metaRow).toHaveTextContent("2 h");
  });

  it("renders without meta row when no rating or class data exists", () => {
    const bareCourse = {
      id: 2,
      name: "New Course",
      description: "A new course without ratings",
      thumbnail: "https://example.com/thumbnail2.jpg",
    };

    const { container } = render(<Course {...bareCourse} />);

    // No data -> no meta row at all
    expect(container.querySelector("[class*='metaRow']")).toBeNull();
  });
});
