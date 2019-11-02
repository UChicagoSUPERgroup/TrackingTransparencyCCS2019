import React from 'react'
import WordCloud from 'react-d3-cloud'
import { scalePow } from 'd3-scale'
import Text from '@instructure/ui-elements/lib/components/Text'

function fontSizeMapper (min, max, numEntries, height) {
  let Px = [0.02, 0.01]
  if (numEntries < 4) {
    Px = [0.08, 0.04]
  } else if (numEntries < 10) {
    Px = [0.06, 0.03]
  } else if (numEntries < 40) {
    Px = [0.05, 0.02]
  } else if (numEntries < 80) {
    Px = [0.03, 0.02]
  }
  const fontSizeMapper = word => height * (Px[1] + ((word.value - min) / (1 + max - min)) * Px[0])
  return fontSizeMapper
}

const TTWordCloud = (props) => {
  const data = props.data || []
  const height = props.height || 400
  const width = props.width || 400
  const maxFontSize = height / 8
  let min = 0
  let max = 0
  data.forEach(item => {
    min = (item.count < min) ? item.count : min
    max = (item.count > max) ? item.count : max
  })
  const sizeScale = scalePow().domain([min, max]).range([12, height / 8])
  // const rotationScale = scalePow().domain([min, max]).range([-40, 40])
  let wcData = data.map(item => {
    const fontSize = sizeScale(item.count)
    // const rotation = rotationScale(item.count)
    return {
      text: <a href={'#/interests/' + item.name}>{item.name}</a>,
      value: fontSize
      // rotation: rotation
    }
  })
  // console.log(wcData)

  return (
    <WordCloud
      data={wcData}
      height={height}
      width={width}
      font='-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
    />
  )
}

export default TTWordCloud
