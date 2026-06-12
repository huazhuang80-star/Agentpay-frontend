import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders the children", () => {
    render(<Badge>hello</Badge>);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it("applies the danger variant classes", () => {
    render(<Badge variant="danger">danger</Badge>);
    const el = screen.getByText(/danger/i);
    expect(el.className).toMatch(/rose/);
  });
});
