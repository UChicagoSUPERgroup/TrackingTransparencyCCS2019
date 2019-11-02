import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'

import colors from '../../colors'

export default class TrackerDetailPage extends React.Component {
  constructor (props) {
    super(props)
    this.wcRef = React.createRef()
    this.tracker = this.props.match.params.name
    this.state = { }
  }

  async componentDidMount () {
    const { hideInferenceContent } = this.props

    const queryObj = {tracker: this.tracker}
    const background = await browser.runtime.getBackgroundPage()
    this.DetailPage = (await import(/* webpackChunkName: "dashboard/DetailPage" */'../components/DetailPage')).default

    const inferencesP = !hideInferenceContent ? background.queryDatabase('getInferencesByTracker', queryObj) : null
    const domainsP = background.queryDatabase('getDomainsByTracker', queryObj)
    const pagesP = background.queryDatabase('getPagesByTracker', queryObj)
    const trackerDataP = import(/* webpackChunkName: "data/trackerData" */'../../data/trackers/companyData.json')

    const [inferences, domains, pages, trackerData] =
      await Promise.all([inferencesP, domainsP, pagesP, trackerDataP])

    const trackerInfo = trackerData.default[this.tracker]

    const metrics = [
      {
        // name: 'Type',
        // value: trackerInfo.type
      // }, {
        name: 'Sites',
        value: domains.length
      }, {
        name: 'Pages',
        value: pages.length
      }
    ]
    if (inferences) {
      metrics.push({
        name: 'Interests',
        value: inferences.length
      })
    }

    this.setState({
      trackerInfo,
      inferences,
      domains,
      pages,
      metrics
    })
  }

  render () {
    const { trackerInfo, metrics, inferences, domains, pages } = this.state
    const ready = !!pages

    if (!this.DetailPage || !ready) return <Spinner title='Page loading' size='medium' />

    const introText = trackerInfo && trackerInfo.description
      ? <Text>
        <Heading level='h2'>What does {this.tracker} do?</Heading>

        {trackerInfo.description && <div>
          <div dangerouslySetInnerHTML={{__html: trackerInfo.description}} />
        </div>}

        {trackerInfo.notes && <ToggleDetails
          summary={'Read more'}
        >
          <div dangerouslySetInnerHTML={{__html: trackerInfo.notes}} />
        </ToggleDetails>}
      </Text>
      : null

    return (
      <this.DetailPage
        pageType='tracker'
        title={this.tracker}
        icon='eye'
        description={introText}
        accentColor={colors.red1}
        metrics={metrics}
        inferences={inferences}
        domains={domains}
        pages={pages}
        pageTableTitle={'Where has ' + this.tracker + ' tracked you?'}
        pageTableSubtitle={'Pages that had trackers from ' + this.tracker}
        timeChartTitle={'When has ' + this.tracker + ' tracked you?'}
        timeChartSubtitle={'This graph shows the number of pages over time where ' + this.tracker + ' has tracked you.'}
      />
    )
  }
}
