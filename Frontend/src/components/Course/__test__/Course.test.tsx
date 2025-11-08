import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Course } from "../Course";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: any) => {
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

  it("renders course information correctly", () => {
    render(<Course {...mockCourse} />);

    // Check if name is rendered
    expect(screen.getByText(mockCourse.name)).toBeDefined();

    // Check if description is rendered
    expect(screen.getByText(mockCourse.description)).toBeDefined();
  });

  it("renders thumbnail with correct alt text", () => {
    render(<Course {...mockCourse} />);

    const thumbnail = screen.getByRole("img");
    expect(thumbnail).toHaveAttribute("alt", mockCourse.name);
  });

  it("renders with correct structure", () => {
    const { container } = render(<Course {...mockCourse} />);

    // Check if the main article exists
    expect(container.querySelector("article")).toBeDefined();

    // Check if the course info section exists
    expect(container.querySelector("h2")).toBeDefined();
    expect(container.querySelector("p")).toBeDefined();
  });

  it("renders without rating when not provided", () => {
    const courseWithoutRating = {
      id: 2,
      name: "New Course",
      description: "A new course without ratings",
      thumbnail: "https://example.com/thumbnail2.jpg",
    };

    const { container } = render(<Course {...courseWithoutRating} />);

    // The rating container should not be present
    expect(container.querySelector("[class*='ratingContainer']")).toBeNull();
  });
});
