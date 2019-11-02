import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'

import { getPopularityString, getComfortString } from './interestHelpers'
import colors from '../../colors'

export default class InferenceDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.inference = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const queryObj = {inference: this.inference}
    const background = await browser.runtime.getBackgroundPage()
    this.DetailPage = (await import(/* webpackChunkName: "dashboard/DetailPage" */'../components/DetailPage')).default

    const trackersP = background.queryDatabaseRecursive('getTrackersByInference', queryObj)
    const domainsP = background.queryDatabaseRecursive('getDomainsByInference', queryObj)
    const pagesP = background.queryDatabaseRecursive('getPagesByInference', queryObj)
    const interestDataP = import(/* webpackChunkName: "data/trackerData" */'../../data/interests/interests.json')

    const [trackers, domains, pages, interestData] =
      await Promise.all([trackersP, domainsP, pagesP, interestDataP])

    const interestInfo = interestData.default[this.inference]

    const metrics = [
      {
        name: 'Sites',
        value: domains.length
      }, {
        name: 'Pages',
        value: pages.length
      }, {
        name: 'Trackers',
        value: trackers.length
      }
    ]

    this.setState({
      trackers,
      domains,
      pages,
      metrics,
      interestInfo
    })
  }

  render () {
    const { metrics, trackers, domains, pages, interestInfo } = this.state
    const ready = !!pages

    if (!this.DetailPage || !ready) return <Spinner title='Page loading' size='medium' />

    let popularity = getPopularityString(interestInfo)
    let comfort = getComfortString(interestInfo)

    const introText = <Text>
      {popularity && <p><strong>{this.inference}</strong> is a <strong>{popularity}</strong> interest.</p>}
      {comfort && <p>Other people are often <strong>{comfort}</strong> with having their interest in this topic being used to personalize their web experience.</p>}
    </Text>

    return (
      <this.DetailPage
        pageType='inference'
        title={this.inference}
        icon='thumbs-up'
        description={introText}
        metrics={metrics}
        accentColor={colors.blue1}
        trackers={trackers}
        domains={domains}
        pages={pages}
        pageTableTitle={'What pages have you visited about ' + this.inference + '?'}
        pageTableSubtitle={'Pages that may have been about ' + this.inference}
        timeChartTitle={'When have you visited pages about ' + this.inference + '?'}
        timeChartSubtitle={'This graph shows the number of pages you visited over time that may be about ' + this.inference + '.'}
      />
    )
  }
}
