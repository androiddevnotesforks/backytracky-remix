import React from "react";
import { fireEvent, render } from "@testing-library/react";
import ChordEditorModal from "../app/components/track/ChordEditorModal";
import type { Subdivision } from "tone/build/esm/core/type/Units";

// @ts-expect-error
global.IntersectionObserver = class FakeIntersectionObserver {
  observe() {}
  disconnect() {}
};

// jest.mock("@headlessui/react", () => ({
//   Transition: jest.fn(),
//   Dialog: jest.autoMockOn(),
// }));

// jest.mock("@tonaljs/tonal", () => ({
//   Chord: jest.autoMockOn(),
// }));

jest.mock("tone", () => ({
  start: jest.fn(),
  Sampler: jest.fn(() => ({
    toDestination: jest.fn(),
  })),
  Transport: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    loop: jest.fn(),
    dispose: jest.fn(),
  })),
  Synth: jest.fn(() => ({
    toDestination: jest.fn(),
  })),
  Part: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    dispose: jest.fn(),
  })),
}));

const sampleChord = {
  note: ["C3", "E3", "G3", "B3"],
  duration: "4n" as Subdivision,
  time: "0:0:0",
  root: "C",
  type: "maj",
  extension: "7",
  bar: 0,
  beat: 0,
  sixteenth: 0,
  ghostTime: "0:0:0",
};

describe("Chord Editor Modal Component", () => {
  it.only("renders correctly and has clickable buttons to change a chord", () => {
    const close = jest.fn();
    const { getByText, baseElement } = render(
      <ChordEditorModal
        isOpen={true}
        currentChord={sampleChord}
        onClose={close}
      />
    );

    getByText(/change chord/i);
    const saveButton = getByText(/save/i);
    const rootButton = getByText(/Bb/i);
    const octaveButton = getByText(/4/i);
    const typeButton = getByText(/maj/i);
    const extensionButton = getByText(/7b9/i);

    fireEvent.click(rootButton);
    fireEvent.click(octaveButton);
    fireEvent.click(typeButton);
    fireEvent.click(extensionButton);

    fireEvent.click(saveButton);

    getByText(/change chord/i);

    fireEvent.click(baseElement);
    expect(close).toHaveBeenCalled();
  });

  it.only("renders correctly and has clickable buttons to change a chord", () => {
    render(
      <ChordEditorModal
        isOpen={false}
        currentChord={sampleChord}
        onClose={jest.fn()}
      />
    );
  });
});
