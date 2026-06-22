"use client";

import { type ReactNode, useId, useState } from "react";

type Props = {
  label: ReactNode;
  children: ReactNode;
};

export function Tooltip({ label, children }: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          hide();
        }
      }}
    >
      <span
        aria-describedby={visible ? id : undefined}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {visible && (
        <span
          role="tooltip"
          id={id}
          className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow"
        >
          {label}
        </span>
      )}
    </span>
  );
}
