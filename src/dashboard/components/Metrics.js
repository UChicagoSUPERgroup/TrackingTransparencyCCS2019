import React from 'react'

import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'

import TTPanel from './TTPanel'

const Metrics = ({ metrics }) => (
  <TTPanel>
    <MetricsList>
      {metrics && metrics.map(m => (
        <MetricsListItem key={m.name} label={m.name || ''} value={m.value || ''} />
      ))}
    </MetricsList>
  </TTPanel>
)

export default Metrics
