import { render, screen } from "@testing-library/react";
import { Header } from "../Header";

describe("Header", () => {
  it("renders a named navigation landmark with all entries", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
    for (const label of ["Home", "Services", "Usage", "Agents", "Admin"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });
});
