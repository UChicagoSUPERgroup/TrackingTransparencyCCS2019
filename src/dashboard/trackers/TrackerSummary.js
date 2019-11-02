import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'

export default class TrackerSummary extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      inferences: [],
      topSites: []
    }

    this.updateData = this.updateData.bind(this)
  }

  componentDidMount () {
    this.updateData()
  }

  async updateData () {
    const background = await browser.runtime.getBackgroundPage()
    const { tracker, hideInferenceContent } = this.props

    if (!hideInferenceContent) {
      const inferences = background.queryDatabaseRecursive('getInferencesByTracker', {tracker: tracker})
      inferences.then(is => this.setState({
        inferences: is
      }))
    }
    const topSites = background.queryDatabaseRecursive('getDomainsByTracker', {tracker: tracker})
    topSites.then(ts => this.setState({
      topSites: ts
    }))
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.tracker) {
      this.setState({
        tracker: nextProps.tracker
      })
    }
    if (nextProps.numPages) {
      this.setState({
        numPages: nextProps.numPages
      })
    }
    this.updateData()
  }

  render () {
    const { tracker, numPages, hideInferenceContent } = this.props
    const { inferences, topSites } = this.state

    let content

    /* inadequate data/error conditions */

    if (!tracker) {
      content = (
        <p>This category does not exist.</p>
      )

    /* main condition */
    } else {
      content = (
        <div>
          <MetricsList>
            <MetricsListItem label='Pages' value={numPages} />
            <MetricsListItem label='Sites' value={topSites.length} />
            {!hideInferenceContent && <MetricsListItem label='Interests' value={inferences.length} />}
          </MetricsList>
          <Text>
            <p>
              <span><strong>{tracker}</strong> was present on <strong>{numPages} pages</strong> across <strong>{topSites.length} sites</strong> that you visited since installing {EXT.NAME}.</span>
              {!hideInferenceContent && <span> From those tracking encounters, they may have guessed that you are interested in <strong>{inferences.length} topics</strong>.</span>}
            </p>
          </Text>
        </div>
      )
    }

    return (<div>
      <Heading level='h2' margin='0 0 medium 0'>{tracker}</Heading>
      {content}
    </div>)
  }
}
