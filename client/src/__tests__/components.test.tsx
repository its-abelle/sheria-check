import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { OffenseCard } from "../components/OffenseCard";
import { CategoryCard } from "../components/CategoryCard";

const offense = {
  id: "test-offense",
  name: "Test Offense",
  aliases: ["test"],
  description: "A test offense for testing purposes",
  category: "traffic-rules",
  severity: "minor" as const,
  citation: "Test Act, Section 1",
  act: "Test Act",
  section: "Section 1",
  min_fine: 500,
  max_fine: 5000,
  max_imprisonment: null,
  course_of_action: "Do not pay on the spot.",
  law_version: "2024",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const category = {
  id: "speeding-reckless",
  name: "Speeding & Reckless Driving",
  description: "Speeding and reckless driving offenses",
  icon: "gauge",
  count: 5,
};

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search an offense/i)).toBeDefined();
  });

  it("calls onChange when typing", async () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/search an offense/i);
    await userEvent.type(input, "speeding");
    expect(onChange).toHaveBeenCalled();
  });

  it("displays the current value", () => {
    render(<SearchBar value="speeding" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search an offense/i) as HTMLInputElement;
    expect(input.value).toBe("speeding");
  });
});

describe("OffenseCard", () => {
  it("renders offense name and fine range", () => {
    render(
      <BrowserRouter>
        <OffenseCard offense={offense} />
      </BrowserRouter>
    );
    expect(screen.getByText("Test Offense")).toBeDefined();
    expect(screen.getByText(/KES 500/)).toBeDefined();
    expect(screen.getByText(/KES 5,000/)).toBeDefined();
  });

  it("renders severity badge", () => {
    render(
      <BrowserRouter>
        <OffenseCard offense={offense} />
      </BrowserRouter>
    );
    expect(screen.getByText("minor")).toBeDefined();
  });

  it("links to offense detail page", () => {
    render(
      <BrowserRouter>
        <OffenseCard offense={offense} />
      </BrowserRouter>
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/offense/test-offense");
  });

  it("shows imprisonment when present", () => {
    const felony = { ...offense, severity: "felony" as const, max_imprisonment: "2 years" };
    render(
      <BrowserRouter>
        <OffenseCard offense={felony} />
      </BrowserRouter>
    );
    expect(screen.getByText(/2 years/)).toBeDefined();
  });
});

describe("CategoryCard", () => {
  it("renders category name and description", () => {
    render(
      <BrowserRouter>
        <CategoryCard category={category} />
      </BrowserRouter>
    );
    expect(screen.getByText("Speeding & Reckless Driving")).toBeDefined();
    expect(screen.getByText("5 offenses")).toBeDefined();
  });

  it("links to category page", () => {
    render(
      <BrowserRouter>
        <CategoryCard category={category} />
      </BrowserRouter>
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/category/speeding-reckless");
  });
});
