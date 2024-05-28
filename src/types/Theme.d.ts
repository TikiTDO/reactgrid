import React, { CSSProperties } from "react";

type ColumnsTemplateFunction = ({ amount, widths }: { amount: number; widths: string[] }) => string;
type RowsTemplateFunction = ({ amount, heights }: { amount: number; heights: string[] }) => string;

export type Offset = { top?: number; right?: number; bottom?: number; left?: number };

export type Border = {
  width: CSSProperties["borderWidth"];
  style: CSSProperties["borderStyle"];
  color: CSSProperties["borderColor"];
};

type Font = {
  family: CSSProperties["fontFamily"];
  size: CSSProperties["fontSize"];
  weight: CSSProperties["fontWeight"];
};

type Padding = {
  top: CSSProperties["paddingTop"];
  right: CSSProperties["paddingRight"];
  bottom: CSSProperties["paddingBottom"];
  left: CSSProperties["paddingLeft"];
};

export interface RGTheme {
  font: Font;
  grid: {
    templates: {
      columns: ColumnsTemplateFunction;
      rows: RowsTemplateFunction;
    };
    gap: {
      width: string;
      /** Changes grid's background color for the gap to appear colored */
      color: string;
    };
  };
  paneContainer: {
    top: {
      background: string;
    };
    right: {
      background: string;
    };
    bottom: {
      background: string;
    };
    left: {
      background: string;
    };
  };
  cellContainer: {
    padding: Padding;
    background: string;
  };
  area: {
    border: Border;
  };
  focusIndicator: {
    background: string;
    border: Border;
  };
  fillHandle: {
    background: string;
    border: Border;
  };
  line: { backgroundColor: React.CSSProperties["backgroundColor"]; size: number | string };
  resizeColumn: {
    default: React.CSSProperties;
    hover: React.CSSProperties;
  };
  selectionIndicator: {
    background: string;
    border: Border;
  };
  gridWrapper?: React.CSSProperties;
}

// Makes all properties in T optional, including nested properties, but excluding functions
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]>;
};

// This tells Emotion's ThemeProvider that the theme object is of type RGTheme
declare module "@emotion/react" {
  export interface Theme extends DeepPartial<RGTheme> {}
}