import React from 'react'
import PropTypes from 'prop-types'
import { SizeMe } from 'react-sizeme'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import List from '@instructure/ui-elements/lib/components/List'
import ListItem from '@instructure/ui-elements/lib/components/List/ListItem'
import Link from '@instructure/ui-elements/lib/components/Link'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import logging from '../dashboardLogging'
import Metrics from '../components/Metrics'
import PageTable from '../components/PageTable'
import PageTimeGraph from '../components/PageTimeGraph'
import SmallGraphAndTable from '../components/SmallGraphAndTable'
import TTPanel from '../components/TTPanel'
import TTPanel2 from '../components/TTPanel2'
import WordCloud from '../components/WordCloud'

import * as moment from 'moment'

export default class DetailPage extends React.Component {
  constructor (props) {
    super(props)
    const { metrics, inferences, domains, trackers, pages, pageType } = props
    const timestamps = pages.map(x => x.id).sort((a, b) => a - b)
    this.state = {
      metrics,
      inferences,
      domains,
      trackers,
      pages,
      timestamps,
      showDomains: !!domains,
      showInferences: !!inferences,
      showTrackers: !!trackers,
      pageType
    }
    this.renderPageTable = this.renderPageTable.bind(this)
    this.renderPageTimeGraph = this.maybeRenderPageTimeGraph.bind(this)
  }

  async componentWillUnmount () {}

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()

    this.setState({pageType: this.props.pageType})

    // LOGGING
    let pageType = this.props.pageType
    let hashedTitle = 'not hashed yet'
    if (pageType === 'site') {
      // console.log('this is alright ', pageType);
      hashedTitle = await background.hashit_salt(this.props.title)
    } else {
      hashedTitle = this.props.title
    }
    // console.log(hashedTitle);
    let sendDict = {
      pageType: pageType,
      hashedTitle: hashedTitle
    }
    let temp = []
    temp = this.state.metrics
    let summaryStat = {}
    for (let i = 0; i < temp.length; i++) {
      let value = temp[i]
      summaryStat[value['name']] = value['value']
    }
    sendDict['summary'] = summaryStat

    if (this.state.showInferences) {
      temp = this.state.inferences
      let numInferences = temp.length
      let hashedInferences = []
      for (let i = 0; i < temp.length; i++) {
        // let value = domains[i]['inference']
        let value = temp[i]
        value['name'] = value['name']
        hashedInferences.push(value)
      }
      // sendDict['numInferences']=numInferences;
      sendDict['hashedInferences'] = JSON.stringify(hashedInferences);
    }
    /*
    if (this.state.showTrackers){
        temp = this.state.trackers
        let numTrackers = temp.length
        let hashedTrackers=[]
        for (let i = 0; i < temp.length; i++) {
         //let value = domains[i]['inference']
         let value = temp[i]
         hashedTrackers.push(value)
       }
       //sendDict['numTrackers']=numTrackers;
       //sendDict['hashedTrackers']=JSON.stringify(hashedTrackers);
    }
    if (this.state.showDomains){
        temp = this.state.domains
        let numDomains = temp.length
        let hashedDomains=[]
        for (let i = 0; i < temp.length; i++) {
         //let value = domains[i]['inference']
         let value = temp[i]
         hashedDomains.push(value)
       }
       //sendDict['numDomains']=numDomains;
       //sendDict['hashedDomains']=JSON.stringify(hashedDomains);
    }
*/
    let activityType = 'open detail page for ' + pageType
    logging.logLoad(activityType, sendDict)
  }

  renderPageTable () {
    const { title, pageTableTitle, pageTableSubtitle } = this.props
    const { pages, showDomains, showInferences } = this.state
    return (
      <TTPanel>
        <Heading level='h2' margin='0 0 medium 0'>{pageTableTitle}</Heading>
        <PageTable
          title={pageTableSubtitle}
          data={pages}
          showSite={showDomains}
          showInference={showInferences}
        />
      </TTPanel>
    )
  }

  maybeRenderPageTimeGraph () {
    const { title, timeChartTitle, timeChartSubtitle, accentColor } = this.props
    const { timestamps } = this.state

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

    if (maxDay > 5) {
      return (
        <TTPanel>
          <Heading level='h2' margin='0 0 medium 0'>{timeChartTitle}</Heading>
          <Text>{timeChartSubtitle}</Text>
          {timestamps.length > 0 && <PageTimeGraph
            timestamps={timestamps}
            color={accentColor}
          />}
        </TTPanel>
      )
    } else {
      return (
        <div />
      )
    }
  }

  wordcloudDescription (pageType, title, numInferences) {
    var topicPlurality = (numInferences == 1 ? 'topic' : 'topics')

    if (pageType == 'tracker') {
      return (
        <div>
          <Heading level='h2'>Based on your browsing, what would <em>{title}</em> think your interests are?</Heading>
          <Text><br />Using a machine to assign categories to pages you visit, {title} may have guessed that you are interested in <strong>{numInferences} {topicPlurality}</strong>.</Text>
        </div>
      )
    } else if (pageType == 'site') {
      return (
        <div>
          <Heading level='h2'>Based on your visits to <em>{title}</em>, what would a tracker think your interests are?</Heading>
          <Text><br />Using a machine to assign categories to pages you visit, trackers on {title} may have guessed that you are interested in <strong>{numInferences} {topicPlurality}</strong>.</Text>
        </div>
      )
    }
  }

  maybeWordCloud (inferences) {
    if (inferences.length > 5) {
      return (
        <div>
          <Text><em>Click on a link in the wordcloud to learn more about each interest.</em><br /><br /></Text>
          <SizeMe>
            {({ size }) => (
              <WordCloud
                data={inferences}
                height={inferences.length < 10 ? 250 : 500}
                width={size.width}
              />
            )}
          </SizeMe>
        </div>
      )
    } else { // not enough data points, just show bulleted list
      return (
        <div style={{'marginTop': '1.5em'}}>
          <List>
            {inferences.map(function (inference) {
              let key = inference.name
              return (<ListItem key={key}>
                <Link href={'#/interests/' + key}>
                  {key}
                </Link>
              </ListItem>)
            })}
          </List>
        </div>
      )
    }
  }

  render () {
    const { title, description, accentColor, icon } = this.props
    const { domains, inferences, trackers, metrics, pageType } = this.state
    const ready = !!metrics
    if (!ready) return <Text>Loading…</Text>

    return (
      <div>
        <Grid>
          <GridRow>
            <GridCol>
              <Heading level='h1'><FontAwesomeIcon icon={icon} /><strong>&nbsp;  Your <em>{title}</em> profile</strong></Heading>
            </GridCol>
          </GridRow>
          <GridRow>
            {description && <GridCol>
              <TTPanel>
                {description}
              </TTPanel>
            </GridCol>}
          </GridRow>
          <GridRow>
            {inferences && <GridCol width={6}>
              <TTPanel>
                {this.wordcloudDescription(pageType, title, inferences.length)}
                {this.maybeWordCloud(inferences)}
              </TTPanel>
            </GridCol>}
            {domains && <GridCol width={6}>
              <TTPanel>
                <SmallGraphAndTable
                  // name='Sites'
                  name='On which sites were you tracked?'
                  data={domains}
                  c1Header='Sites'
                  urlStem='#/sites/'
                  color={accentColor}
                  pageType={pageType}
                  title={title}
                />
              </TTPanel>
            </GridCol>}
            {trackers && <GridCol width={6}>
              <TTPanel>
                <SmallGraphAndTable
                  // name='Trackers'
                  name='Which trackers could have tracked you?'
                  data={trackers}
                  c1Header='Trackers'
                  urlStem='#/trackers/'
                  color={accentColor}
                  pageType={pageType}
                  title={title}
                />
              </TTPanel>
            </GridCol>}
          </GridRow>
          <GridRow>
            <GridCol>
              {this.renderPageTable()}
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol>
              {this.maybeRenderPageTimeGraph()}
            </GridCol>
          </GridRow>
        </Grid>
      </div>
    )
  }
}

DetailPage.propTypes = {
  title: PropTypes.string.isRequired,
  pageType: PropTypes.string.isRequired,
  description: PropTypes.element,
  accentColor: PropTypes.string,
  metrics: PropTypes.array.isRequired,

  inferences: PropTypes.array,
  domains: PropTypes.array,
  trackers: PropTypes.array,
  pages: PropTypes.array,

  pageTableTitle: PropTypes.string,
  pageTableSubtitle: PropTypes.string,
  timeChartTitle: PropTypes.string,
  timeChartSubtitle: PropTypes.string
}
