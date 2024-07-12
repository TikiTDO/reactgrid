import { FC, useEffect, useRef, useState } from "react";
import CellWrapper from "../components/CellWrapper";
import { useCellContext } from "../components/CellContext";
import { useDoubleTouch } from "../hooks/useDoubleTouch";
import { isAlphaNumericWithoutModifiers } from "../utils/keyCodeCheckings";
import { getHiddenTargetFocusByIdx } from "../utils/getHiddenTargetFocusByIdx";

interface TextCellProps {
  value?: string;
  onTextChanged: (newText: string) => void;
  reverse?: boolean;
  style?: React.CSSProperties;
}

export const TextCell: FC<TextCellProps> = ({ value: initialValue, onTextChanged, reverse }) => {
  const ctx = useCellContext();
  const targetInputRef = useRef<HTMLTextAreaElement>(null);
  const [isEditMode, setEditMode] = useState(false);
  const { handleDoubleTouch } = useDoubleTouch(ctx, setEditMode);

  useEffect(() => {
    if (initialValue) targetInputRef.current?.setSelectionRange(initialValue.length, initialValue.length);
  }, [isEditMode, initialValue]);

  return (
    <CellWrapper
      onTouchEnd={handleDoubleTouch}
      style={{ padding: ".2rem", textAlign: "center", outline: "none" }}
      onDoubleClick={() => {
        ctx.isFocused && setEditMode(true);
        // ctx.requestFocus();
      }}
      onKeyDown={(e) => {
        if (isAlphaNumericWithoutModifiers(e) || e.key === "Enter") {
          setEditMode(true);
        }
        if (!isEditMode && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          // ctx.requestFocus();
        }
      }}
    >
      {isEditMode ? (
        <textarea
          defaultValue={initialValue}
          style={{
            resize: "none",
            overflowY: "hidden",
            boxSizing: "border-box",
            textAlign: "center",
            width: "100%",
            height: "100%",
            background: "transparent",
            border: "none",
            padding: 0,
            outline: "none",
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "inherit",
          }}
          onBlur={(e) => {
            onTextChanged(e.currentTarget.value);
            setEditMode(false);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") {
              setEditMode(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              // We don't stop propagation here, because we want to trigger the
              // focus move event
              onTextChanged(e.currentTarget.value);
              setEditMode(false);
              // ctx.requestFocus("Bottom");
            }
          }}
          autoFocus
          ref={targetInputRef}
        />
      ) : reverse ? (
        initialValue?.split?.("").reverse().join("")
      ) : (
        initialValue
      )}
      {/* <button onClick={() => getHiddenTargetFocusByIdx(ctx.realRowIndex, ctx.realColumnIndex)?.focus()}>focus</button> */}
    </CellWrapper>
  );
};
