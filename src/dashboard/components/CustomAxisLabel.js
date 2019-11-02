import React from 'react'

const CustomAxisLabel = (props/*: {
    title: string,
    xAxis: boolean,
    // note these next two are passed down from the parent XYPlot/Flexible*XYPlot
    innerWidth: number,
    innerHeight: number
} */) => {
  // since we rotate the y label, we have to adjust it to center
  // (ideally we'd rotate about the correct origin, but i couldn't get that working)
  const yLabelOffset = {
    y: props.innerHeight / 2 + props.title.length * 6, // '3' might be different for you depending on your font size/char width
    x: 10
  }

  const yShift = props.yShift || 1.2

  const xLabelOffset = {
    x: props.innerWidth * 0.6,
    y: props.innerHeight + 60 // 1.2 was enough for me to get it below x axis. you may need a diff't #
  }
  const transform = props.xAxis
    ? `translate(${xLabelOffset.x}, ${xLabelOffset.y})`
    : `translate(${yLabelOffset.x}, ${yLabelOffset.y}) rotate(-90)`

  return (
    <g
      transform={transform}
    >
      <text>{props.title}</text>
    </g>
  )
}

CustomAxisLabel.displayName = 'CustomAxisLabel'
CustomAxisLabel.requiresSVG = true

export default CustomAxisLabel
