import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'

import { getPopularityString, getComfortString } from './interestHelpers'

// import categories from '../../data/categories_comfort_list.json'

// const SensitivePanel = (inference) => {
//   let sensitiveCategories = categories.slice(0, 20)
//   let sensitive = !!((inference && sensitiveCategories.includes(inference)))
//   return (
//     <Text><em>{inference}</em>
//       {sensitive
//         ? ' may be considered a sensitive topic.'
//         : ' is likely not a sensitive topic.'
//       }</Text>
//   )
// }

export default class InferenceSummary extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.updateData = this.updateData.bind(this)
  }

  componentDidMount () {
    this.updateData()
  }

  async updateData () {
    const background = await browser.runtime.getBackgroundPage()
    const { inference } = this.props

    const trackersP = background.queryDatabaseRecursive('getTrackersByInference', {inference: inference})
    const topSitesP = background.queryDatabaseRecursive('getDomainsByInference', {inference: inference})
    const [trackers, topSites] = await Promise.all([trackersP, topSitesP])

    this.setState({
      trackers,
      topSites
    })

    const interestData = await import(/* webpackChunkName: "data/trackerData" */'../../data/interests/interests.json')
    const interestInfo = interestData.default[inference]
    this.setState({ interestInfo })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.inference) {
      this.setState({
        inference: nextProps.inference
      })
    }
    this.updateData()
  }

  render () {
    const { inference } = this.props
    const { trackers, topSites, interestInfo } = this.state
    if (!Array.isArray(trackers) || !Array.isArray(topSites)) {
      return null
    }

    let content

    /* inadequate data/error conditions */

    if (!inference) {
      return (<div>
        <Heading level='h2' margin='0 0 medium 0'>{inference}</Heading>
        <p>This category does not exist.</p>
      </div>)
    }

    let popularity = getPopularityString(interestInfo)
    let comfort = getComfortString(interestInfo)

    /* main condition */
    content = (
      <div>
        <MetricsList>
          <MetricsListItem label='Sites' value={topSites.length} />
          <MetricsListItem label='Trackers' value={trackers.length} />
        </MetricsList>
        <Text>
          <p><strong>{topSites.length} of the sites</strong> you visited were about {inference}. These sites contained a total of <strong>{trackers.length} trackers</strong>.</p>
          {popularity && <p><strong>{inference}</strong> is a <strong>{popularity}</strong> interest.</p>}
          {comfort && <p>Other people are often <strong>{comfort}</strong> with having their interest in this topic being used to personalize their web experience.</p>}
        </Text>
      </div>
    )

    return (<div>
      <Heading level='h2' margin='0 0 medium 0'>{inference}</Heading>
      {content}
    </div>)
  }
}
