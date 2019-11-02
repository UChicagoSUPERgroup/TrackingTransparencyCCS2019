import React from 'react'
import logging from '../dashboardLogging'
import ReactTable from 'react-table'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'
import TTPanel from '../components/TTPanel'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const RecentTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {
          id: 'most-recently-visited',
          Header: 'Most recently visited sites',
          accessor: x => x,
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const NoTrackerTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Sites without trackers (' + numEntries + ')',
          accessor: d => d,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

const ManyTrackersTable = (data) => {
  let numEntries = data ? data.length : 0
  return (
    <ReactTable
      data={data}
      columns={[
        {Header: 'Sites with the most trackers',
          accessor: d => d.Pages.domain,
          id: 'domain',
          Cell: row => (
            <div key={row.value}>
              <Link className='domainTableLinkTrackersPage' href={'#/sites/' + row.value}>
                {row.value}
              </Link>
            </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Trackers
          </div>),
        accessor: d => d.Trackers['COUNT(DISTINCT(tracker))'],
        id: 'trackers',
        Cell: row => (
          row.value),
        maxWidth: 200
        }
      ]}
      defaultPageSize={10}
      showPageJump={false}
      showPageSizeOptions={false}
      className='-striped -highlight'
    />
  )
}

export default class SiteOverview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      domains: []
    }
    this.getData = this.getData.bind(this)
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()

    let now = new Date(Date.now()).getTime()
    let args = {count: 100, endTime: now}

    const numPages = background.queryDatabase('getNumberOfPages', {})
    const numDomains = background.queryDatabase('getNumberOfDomains', {})
    numPages.then(n => this.setState({numPages: n}))
    numDomains.then(n => this.setState({numDomains: n}))

    const recent = background.queryDatabase('getDomains', args)
    const manyTrackers = background.queryDatabase('getDomainsByTrackerCount', args)
    const noTrackers = background.queryDatabase('getDomainsNoTrackers', {})

    recent.then(n => this.setState({recent: n}))
    manyTrackers.then(n => this.setState({manyTrackers: n}))
    noTrackers.then(n => this.setState({noTrackers: n}))
  }

  async componentDidMount () {
    let d = this.getData()

    let recent = this.state.recent

    const background = await browser.runtime.getBackgroundPage()
    let pages = []
    if (recent) {
      for (let i = 0; i < recent.length; i++) {
        let value = await background.hashit_salt(domains[i]['Pages']['domain'])
        pages.push(value)
      }
    }
    let activityType = 'load dashboard Sites page'
    let sendDict = {'numDomainsShown': pages.length}
    logging.logLoad(activityType, sendDict)
  }

  render () {
    const { numPages, noTrackers, numDomains } = this.state
    const { hideInferenceContent, hideTrackerContent } = this.props

    let numDNT, nodata
    if (noTrackers) {
      numDNT = noTrackers.length
    } else {
      numDNT = NaN
      nodata = true
    }

    // let numDNT = noTrackers ? noTrackers.length : NaN

    let percentTrackedSites = (((numDomains - numDNT) / numDomains) * 100).toFixed(1)
    let ok = !Number.isNaN(percentTrackedSites)

    return (
      <Grid startAt='medium'>
        <GridRow>
          <GridCol>
            <Heading level='h1'><FontAwesomeIcon icon='window-maximize' /><strong>&nbsp; Where were you tracked?</strong></Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <TTPanel>
              <Text>
                <p>Since installing this browser extension, you have visited <strong>{numPages} different pages</strong> on <strong>{numDomains} sites</strong>.</p>
                <p>Trackers see which sites you visited through a variety of tracking methods, including third-party cookies, tracking pixels, and browser fingerprinting. When a tracker sees that you have visited multiple sites, they can use that activity to link together your interests.</p>
                {ok && !hideTrackerContent && <p>Tracker activity was detected on <strong>{percentTrackedSites}% of the sites you have visited. </strong></p>}
                {nodata && <p>Come back after visiting a few sites to see your activity.</p>}
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol width={3}>
            <TTPanel padding='small'>
              {RecentTable(this.state.recent)}
            </TTPanel>
          </GridCol>
          {!hideTrackerContent &&
            <GridCol width={6}>
              <TTPanel padding='small'>
                {ManyTrackersTable(this.state.manyTrackers)}
              </TTPanel>
            </GridCol>
          }
          {!hideTrackerContent &&
            <GridCol width={3}>
              <TTPanel padding='small'>
                {NoTrackerTable(this.state.noTrackers)}
              </TTPanel>
            </GridCol>
          }
        </GridRow>
      </Grid>
    )
  }
}
