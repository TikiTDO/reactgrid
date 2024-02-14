import { RGTheme } from "../types/Theme";

const lightTheme: RGTheme = {
  font: {
    family: "",
    size: "",
    weight: ""
  },
  grid: {
    templates: {
      columns: ({ widths }) => widths.join(" "),
      rows: ({ heights }) => heights.join(" ")
    },

    gap: {
      width: "2px",
      color: "#efefef"
    },
    // padding: {
    //   top: "",
    //   right: "",
    //   bottom: "",
    //   left: ""
    // },
    // margin: {
    //   top: "",
    //   right: "",
    //   bottom: "",
    //   left: ""
    // },
  },
  cellContainer: {
    padding: {
      top: "2px",
      right: "2px",
      bottom: "2px",
      left: "2px"
    },
    border: {
      width: "2px",
      style: "solid",
      color: "#000"
    }
  },
  area: {
    border: {
      color: "lightblue",
      style: "solid",
      width: "2px",
    }
  },
  focusIndicator: {
    background: "transparent",
    border: {
      color: "#3bb6df",
      style: "solid",
      width: "2px",
    }
  },
  selectionIndicator: {
    background: "#add8e630",
    border: {
      color: "lightblue",
      style: "solid",
      width: "2px",
    }
  
  }
};

export default lightTheme;