import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useLocalState } from "../useLocalState";

function Probe({
  storageKey = "agentpay:test",
  initial = "fallback",
  onValue,
}: {
  storageKey?: string;
  initial?: string;
  onValue?: (value: string) => void;
}) {
  const [value, setValue] = useLocalState(storageKey, initial);
  onValue?.(value);

  return (
    <div>
      <output aria-label="value">{value}</output>
      <button type="button" onClick={() => setValue("updated")}>
        Write
      </button>
    </div>
  );
}

describe("useLocalState", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("returns the fallback before hydrating from localStorage", async () => {
    window.localStorage.setItem("agentpay:test", JSON.stringify("stored"));
    const onValue = jest.fn();

    render(<Probe onValue={onValue} />);

    expect(onValue).toHaveBeenNthCalledWith(1, "fallback");
    await waitFor(() => expect(screen.getByLabelText("value")).toHaveTextContent("stored"));
  });

  it("writes updates to state and localStorage", () => {
    render(<Probe />);

    fireEvent.click(screen.getByRole("button", { name: "Write" }));

    expect(screen.getByLabelText("value")).toHaveTextContent("updated");
    expect(window.localStorage.getItem("agentpay:test")).toBe(JSON.stringify("updated"));
  });

  it("falls back when stored JSON is malformed", async () => {
    window.localStorage.setItem("agentpay:test", "{not-json");

    render(<Probe />);

    await waitFor(() => expect(screen.getByLabelText("value")).toHaveTextContent("fallback"));
  });

  it("keeps state updated when localStorage writes fail", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    render(<Probe />);
    fireEvent.click(screen.getByRole("button", { name: "Write" }));

    expect(screen.getByLabelText("value")).toHaveTextContent("updated");
  });
});
