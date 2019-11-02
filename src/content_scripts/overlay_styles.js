const outer = `
  all: initial !important;
  z-index: 2147483647 !important;
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  width: 150px !important;
  height: 120px !important;
  padding: 0px !important;
  border: 1px solid rgba(0,0,0,0.5) !important;
  border-radius: 5px !important;
  background-color: #D6D6CE !important;
  color: #fff !important;
  opacity: 0.9 !important;
  animation: fadein 0.5s !important;
  font: 10pt sans-serif !important;
`

const inner = `
  body {
    margin: 0;
    padding: 0;
    color: black;
    font: 10pt sans-serif;
  }

  #tt_overlay_content {
    overflow-wrap: break-word;
    padding: 10px;
  }

  #tt_closebutton {
    position: absolute;
    top: 0px;
    left: 6px;
    margin-bottom: 5px;
    background-color: inherit;
    opacity: 0.9;
    z-index: 500;
    color: #8F3931;
    font-size: 14pt;
  }
`

export default { outer, inner }
