import React from 'react'

import Button from '@instructure/ui-buttons/lib/components/Button'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import IconArrowOpenEnd from '@instructure/ui-icons/lib/Solid/IconArrowOpenEnd'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import Text from '@instructure/ui-elements/lib/components/Text'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import colors, { axisStyle } from '../../colors'
import CustomAxisLabel from '../components/CustomAxisLabel'
import TrackerSummary from './TrackerSummary'
import TTPanel from '../components/TTPanel'
import logging from '../dashboardLogging'

import ReactTable from 'react-table'

import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  HorizontalBarSeries,
  Hint
} from 'react-vis'

const TrackerTable = (data) => {
  const pagecountTooltipText = (
    <div style={{width: 160}}>
      This column shows, for each tracker, how many pages you were tracked on.
    </div>
  )

  const pagecountTooltip = (
    <Tooltip
      tip={pagecountTooltipText}
      variant='inverse'
      placement='end'
    >
      <IconInfo />
    </Tooltip>
  )

  const percentbrowsingTooltipText = (
    <div style={{width: 160}}>
      This column, for each tracker, the percentage of your overall browsing that was tracked.
    </div>
  )

  const percentbrowsingTooltip = (
    <Tooltip
      tip={percentbrowsingTooltipText}
      variant='inverse'
      placement='end'
    >
      <IconInfo />
    </Tooltip>
  )

  return (
    <ReactTable
      data={data}
      columns={[
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Tracker
          </div>),
        accessor: 'name',
        Cell: row => (
          <div key={row.value}>
            <Link className='trackerTableLinkTrackersPage' to={{pathname: '/trackers/' + row.value}}>
              {row.value}
            </Link>
          </div>)
        },
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Page Count {pagecountTooltip}
          </div>),
        accessor: 'count',
        Cell: row =>
          <div style={{textAlign: 'right'}}>
            {row.value}
          </div>},
        {Header: h => (
          <div style={{textAlign: 'center'}}>
            Percent of Browsing {percentbrowsingTooltip}
          </div>),
        accessor: 'percent',
        Cell: row =>
          <div style={{textAlign: 'right'}}>
            {row.value.toFixed(2) + ' %'}
          </div>}
      ]}
      // defaultPageSize={20}
      className='-striped -highlight'
    />
  )
}

export default class TrackerOverview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      trackers: [],
      graphCount: 25,
      numTrackers: '…'
    }
    // this.logLoad = this.logLoad.bind(this);
    this.updateGraphCount = this.updateGraphCount.bind(this)
  }

  async getTrackers () {
    const background = await browser.runtime.getBackgroundPage()
    const numTrackers = await background.queryDatabase('getNumberOfTrackers', {})
    const numPages = await background.queryDatabase('getNumberOfPages', {})
    const trackers = await background.queryDatabase('getTrackers', {})

    let graphData = []
    let allData = []
    for (let val in trackers) {
      const name = trackers[val]['tracker']
      const pageCount = trackers[val]['COUNT(tracker)']
      const percent = 100 * pageCount / numPages
      graphData.unshift({
        y: name,
        x: pageCount
      })
      allData.push({
        name: name,
        count: pageCount,
        percent: percent
      })
    }

    this.setState({
      trackers: trackers,
      graphDataAll: graphData,
      graphData: graphData.slice(-this.state.graphCount),
      allData: allData,
      numTrackers: numTrackers,
      numPages: numPages
    })
  }

  async componentDidMount () {
    this.getTrackers()

    const background = await browser.runtime.getBackgroundPage()
    const numTrackersShown = await background.queryDatabase('getNumberOfTrackers', {})
    let sendDict = {
      'numTrackersShown': numTrackersShown
    }
    let activityType = 'load dashboard tracker summary page'
    logging.logLoad(activityType, sendDict)
  }

  updateGraphCount (event) {
    const num = parseInt(event.target.value)
    console.log(num)
    const { graphDataAll } = this.state
    this.setState({
      graphCount: num,
      graphData: graphDataAll.slice(-num)
    })
  }

  renderIntroText () {
    const { allData, numTrackers } = this.state
    return (
      <TTPanel>
        <Text>
          <p>
            <strong>{numTrackers} trackers</strong> have been present on the sites you visited since installing {EXT.NAME}.
            {allData && allData[0] && <span> Your most frequently encountered tracker is <strong>{allData[0].name}</strong>, which was present on <strong>{allData[0].percent.toFixed(2)}%</strong> of the pages you visited.</span>}
            {allData && !allData[0] && <span> Return to this page after viewing a few sites to see the trackers in your browsing.</span>}
          </p>
        </Text>
      </TTPanel>
    )
  }

  renderChart () {
    let { graphData, numPages, hovered } = this.state
    if (graphData.length === 0) return null
    graphData = graphData.map(d => ({
      ...d,
      color: (hovered && d.y === hovered.y) ? 1 : 0
    }))
    // const background = await browser.runtime.getBackgroundPage()
    return (
      <TTPanel>
        <FlexibleWidthXYPlot
          yType={'ordinal'}
          height={800}
          margin={{left: 120, bottom: 60}}
          onMouseLeave={() => this.setState({hovered: null})}
          colorDomain={[0, 1]}
          colorRange={[colors.red1, colors.red2]}
        >
          <HorizontalGridLines />
          <VerticalGridLines />
          <YAxis
            height={200}
            tickLabelAngle={0}
            style={axisStyle}
          />
          <XAxis
            tickFormat={v => (v / numPages * 100).toFixed(2) + '%'}
            style={axisStyle}
          />
          {hovered && <Hint
            value={hovered}>
            <div className='rv-hint__content'>
              <div>
                <strong>{hovered.y}</strong><br />
                      Present on {hovered.x} pages<br />
                      ({(hovered.x / numPages * 100).toFixed(2)}% of all pages)
              </div>
            </div>
          </Hint>}
          <HorizontalBarSeries
            data={graphData}
            onValueMouseOver={(datapoint) => {
              this.setState({hovered: datapoint})
            }}
            onValueClick={(datapoint) => {
              this.setState({selectedTracker: datapoint})
              let activityType = 'selected a tracker on trackers page for more info'
              logging.logLoad(activityType, {'tracker_clicked': datapoint['y'], 'tracker_pages': datapoint['x']})
            }}
          />
          <CustomAxisLabel title='Percent of pages' xAxis />
        </FlexibleWidthXYPlot>
        <RadioInputGroup
          name='graph-count'
          value={this.state.graphCount}
          onChange={this.updateGraphCount}
          description='Trackers'
          variant='toggle'
          layout='inline'
          size='small'
        >
          <RadioInput label='25' value={25} context='off' />
          <RadioInput label='50' value={50} context='off' />
          <RadioInput label='75' value={75} context='off' />
        </RadioInputGroup>

      </TTPanel>
    )
  }

  renderInfoPane () {
    const { selectedTracker } = this.state
    const { hideInferenceContent } = this.props

    return (
      <TTPanel textAlign='start'>
        {!selectedTracker && <Text weight='bold'>The graph to the left shows the trackers on the pages you visited. Click a bar to learn more about that tracker.</Text>}
        {selectedTracker && <div>
          <TrackerSummary
            tracker={selectedTracker.y}
            numPages={selectedTracker.x}
            hideInferenceContent={hideInferenceContent}
          />
          <Link
            className='trackerPageSelected-Tracker'
            href={'#/trackers/' + selectedTracker.y}
            icon={IconArrowOpenEnd}
            iconPlacement='end'
          >
            More about this tracker
          </Link>
        </div>}
      </TTPanel>
    )
  }

  render () {
    const { allData, numTrackers } = this.state

    return (
      <Grid>
        <GridRow>
          <GridCol>
            <Heading level='h1'><FontAwesomeIcon icon='eye' /><strong>&nbsp;  Who is tracking you?</strong></Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            {this.renderIntroText()}
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol width={7}>
            {allData && allData.length > 0 && this.renderChart()}
          </GridCol>
          <GridCol width={5}>
            {allData && allData.length > 0 && this.renderInfoPane()}
          </GridCol>
        </GridRow>
      </Grid>
    )
  }
}
