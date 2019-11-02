import React from 'react'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalBarSeries
} from 'react-vis'

import * as moment from 'moment'
import _ from 'lodash'

import { axisStyle } from '../../colors'
import CustomAxisLabel from './CustomAxisLabel'

export default function PageTimeGraph ({ timestamps, color }) {
  const times = timestamps.map(t => moment(t))

  let data = []

  const firstDay = times[0].startOf('day')
  let grouped
  grouped = _.groupBy(times, t => t.diff(firstDay, 'days'))
  for (let day in grouped) {
    data.push({
      x: parseInt(day),
      y: grouped[day].length
    })
  }
  const maxDay = data[data.length - 1].x
  let tickValues = []
  for (let i = 0; i <= maxDay; i++) {
    tickValues.push(i)
  }

  const dataLabel = (v) => {
    return moment(firstDay).add(parseInt(v), 'days').format('ddd MMM Do')
  }

  return (
    <div>
      <FlexibleWidthXYPlot
        height={200}
        margin={{left: 100, right: 10, top: 10, bottom: 70}}>
        <HorizontalGridLines />
        <VerticalBarSeries
          color={color}
          data={data}
        />
        <XAxis
          height={100}
          tickValues={tickValues}
          tickFormat={dataLabel}
          tickLabelAngle={-20}
          style={axisStyle}
        />
        <YAxis
          style={axisStyle}
        />
        <CustomAxisLabel title='Pages' />
        <CustomAxisLabel title='Day' xAxis yShift={1.6} />
      </FlexibleWidthXYPlot>
    </div>
  )
}
