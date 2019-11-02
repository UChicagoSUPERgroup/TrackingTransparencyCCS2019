import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import List from '@instructure/ui-elements/lib/components/List'
import ListItem from '@instructure/ui-elements/lib/components/List/ListItem'
import MetricsList from '@instructure/ui-elements/lib/components/MetricsList'
import MetricsListItem from '@instructure/ui-elements/lib/components/MetricsList/MetricsListItem'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import View from '@instructure/ui-layout/lib/components/View'
import Tag from '@instructure/ui-elements/lib/components/Tag'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Popover, { PopoverTrigger, PopoverContent } from '@instructure/ui-overlays/lib/components/Popover'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'
import CloseButton from '@instructure/ui-buttons/lib/components/CloseButton'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import TTPanel from './components/TTPanel'

const inferenceRecentList = (data) => {
  return (
    <List
      size='small'
    >
      {data.map(function (dataValue) {
        let key = dataValue['DISTINCT(inference)']
        return (<ListItem key={key}>
          <Link href={'#/interests/' + key}>
            {key}
          </Link>
        </ListItem>)
      })}
    </List>
  )
}

const inferenceTopList = (data) => {
  if (!data) {
    return (
      <div>
        <Heading level='h3'>Your Top Trackers<hr /></Heading>
        <Spinner title='Loading…' size='small' />
      </div>
    )
  }
  if (data.length === 0) {
    return (
      <div>
        <Heading level='h3'>Your Top Interests<hr /></Heading>
        <Text>Visit some pages to see if trackers are guessing your interests.</Text>
      </div>
    )
  }
  return (
    <div>
      <Heading level='h3'>Your Top Interests<hr /></Heading>
      <span>
        {data.map((p, i, arr) => {
          const last = (i === (arr.length - 1))
          const inference = p['inference']
          const inferenceLink = <Link href={'#interests/' + inference}>{inference}</Link>
          return (
            <div>
              <span><strong>{i + 1}</strong></span>
              <span key={inference}>
                <Tag text={inferenceLink} size='large' margin='x-small x-small x-small x-small' />
                <br />
              </span>
            </div>
          )
        })}
      </span>
    </div>
  )
}

const trackerList = (data) => {
  if (!data) {
    return (
      <div>
        <Heading level='h3'>Your Top Trackers<hr /></Heading>
        <Spinner title='Loading…' size='small' />
      </div>
    )
  }
  if (data.length === 0) {
    return (
      <div>
        <Heading level='h3'>Your Top Trackers<hr /></Heading>
        <Text>Visit some pages to see if trackers are tracking your browsing.</Text>
      </div>
    )
  }
  return (
    <div>
      <Heading level='h3'>Your Top Trackers<hr /></Heading>
      <span>
        {data.map((p, i, arr) => {
          const last = (i === (arr.length - 1))
          const trackerLink = <Link href={'#trackers/' + p.tracker}>{p.tracker}</Link>
          return (
            <div>
              <span><strong>{i + 1}</strong></span>
              <span key={p.tracker}>
                <Tag text={trackerLink} size='large' margin='x-small x-small x-small x-small' />
                <br />
              </span>
            </div>
          )
        })}
      </span>
    </div>
  )
}

const domainList = (data) => {
  return (
    <List
      size='small'
    >
      {data.map(val => {
        return (<ListItem key={val}>
          <Link href={'#/sites/' + val}>
            {val}
          </Link>
        </ListItem>)
      })}
    </List>
  )
}

export class Home extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      numTrackers: '…',
      numInferences: '…',
      numPages: '…',
      showPopover1: false,
      showPopover2: false,
      showPopover3: false
    }
    // this.logClick = this.logClick.bind(this);
    // this.logLoad = this.logLoad.bind(this);
    this.showPopover1 = this.showPopover1.bind(this);
    this.showPopover2 = this.showPopover2.bind(this);
    this.showPopover3 = this.showPopover3.bind(this);
    this.hidePopover1 = this.hidePopover1.bind(this);
    this.hidePopover2 = this.hidePopover2.bind(this);
    this.hidePopover3 = this.hidePopover3.bind(this);
  }

  showPopover1 () {
    this.setState({
      showPopover1: true
    })
  }

  hidePopover1 () {
    this.setState({
      showPopover1: false
    })
  }

  showPopover2 () {
    this.setState({
      showPopover2: true
    })
  }

  hidePopover2 () {
    this.setState({
      showPopover2: false
    })
  }

  showPopover3 () {
    this.setState({
      showPopover3: true
    })
  }

  hidePopover3 () {
    this.setState({
      showPopover3: false
    })
  }

  renderAppropCloseButton (which) {
    var fn
    if (which == 1) {
      fn = this.hidePopover1
    } else if (which == 2) {
      fn = this.hidePopover2
    } else if (which == 3) {
      fn = this.hidePopover3
    } else {
      return new Error('close button to show not found')
    }

    return (
      <CloseButton
        placement='end'
        offset='x-small'
        variant='icon'
        onClick={fn}
      >
        Close
      </CloseButton>
    )
  }

  arrowPanel () {
    return (
      <TTPanel>
        <Heading level='h3'>What are <em>trackers</em> and <em>interests?</em><hr /></Heading>
        <Grid vAlign='middle' hAlign='space-between' colSpacing='none' rowSpacing='none'>
          <GridRow>
            <GridCol textAlign='center' width={3}>
              <FontAwesomeIcon icon='eye' size='6x' />
            </GridCol>
            <GridCol textAlign='center' >
              <FontAwesomeIcon icon='arrow-right' size='2x' />
            </GridCol>
            <GridCol textAlign='center' width={3}>
              <FontAwesomeIcon icon='thumbs-up' size='5x' />
            </GridCol>
            <GridCol textAlign='center' >
              <FontAwesomeIcon icon='arrow-right' size='2x' />
            </GridCol>
            <GridCol textAlign='center' width={3}>
              <div />
              {this.exampleCluster()}

              {/* <FontAwesomeIcon icon='ad' size='6x' /> */}
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol width={3} textAlign='center'>
              <p>When you browse online, your online activity can be tracked by ad networks and analytics companies.<br /><br />We call these <em>trackers</em>.</p>
            </GridCol>
            <GridCol width={3} textAlign='center'>
              <p>These companies track your browsing to make guesses about what topics you might be interested in. <br /><br />We call these topics <em>interests</em>.</p>
            </GridCol>
            <GridCol width={3} textAlign='center'>
              <div />
              <p>Companies can personalize your online experience based on these interests.<br /><em>Click on the circles above to learn more.</em></p>
            </GridCol>
          </GridRow>

        </Grid>
      </TTPanel>
    )
  }

  examplePanel () {
    return (
      <TTPanel margin='medium 0 0 0'>
        <Heading level='h3'>Give me some examples.<hr /></Heading>
        <Grid vAlign='middle' hAlign='space-between' colSpacing='none' rowSpacing='none'>
          <GridRow>
            <GridCol>
              <View
                as='div'
                display='inline-block'
                margin='large'
                textAlign='center'
                borderRadius='medium'
                maxWidth='200px'
                shadow='resting'
              >
                <p style={{margin: '10px'}}><FontAwesomeIcon icon='paw' size='2x' /><br />You see an ad about dog clothes because you previously visited a blog about traveling with dogs. A third-party tracker on that blog guessed that you have an interest in dogs.</p>
              </View>
            </GridCol>
            <GridCol>
              <View
                as='div'
                display='inline-block'
                margin='large'
                textAlign='center'
                borderRadius='medium'
                maxWidth='200px'
                shadow='resting'
              >
                <p style={{margin: '10px'}}><FontAwesomeIcon icon='search' size='2x' /><br />You want to know more about apples, the fruit, so you search for "apple". However, because you often search for technical topics, you see results for Apple, the company.</p>
              </View>
            </GridCol>
            <GridCol>
              <View
                as='div'
                display='inline-block'
                margin='large'
                textAlign='center'
                borderRadius='medium'
                maxWidth='200px'
                shadow='resting'
              >
                <p style={{margin: '10px'}}><FontAwesomeIcon icon='question' size='2x' /><br />You see an ad for a horror movie, even though you don't like horror movies. However, you recently searched for sweaters and an advertiser decided that sweater fans should see this ad.</p>
              </View>
            </GridCol>
          </GridRow>

        </Grid>
      </TTPanel>
    )
  }

  meanForYouPanel () {
    return (
      <TTPanel margin='medium 0 0 0'>
        <Heading level='h3'>What does this mean for you?<hr /></Heading>
        <Grid>
          <GridRow>
            <GridCol>
              <Text>
                <Heading level='h4'><FontAwesomeIcon icon='user' color='#616530' /> PERSONALIZED SERVICES</Heading>
                <p>Web companies can use data about you and your interests to personalize your web experience, such as by tailoring search results and social feeds, or making suggestions for web sites or places to visit.</p>
                <Heading level='h4'><FontAwesomeIcon icon='paw' color='#616530' /> RELEVANT ADS</Heading>
                <p> Web companies can make a profile of your interests based on the web pages that you visit. Then, they use this profile to show you advertisements that may be related to your interests.</p>
              </Text>
            </GridCol>
            <GridCol>
              <Text>
                <Heading level='h4'><FontAwesomeIcon icon='exclamation-triangle' color='#9A5324' /> UNEXPECTED TARGETED ADVERTISING</Heading>
                <p>When advertisers do targeted advertising, they can use your interests in unexpected ways. For example, an advertiser could show you banana ads because they think people who like dogs will also like bananas.</p>
                <Heading level='h4'><FontAwesomeIcon icon='exclamation-triangle' color='#9A5324' /> INCORRECT GUESSES ABOUT YOUR INTERESTS</Heading>
                <p>A third-party tracker could also guess incorrectly about your interests. If you often visit sites about a topic, such as for work, trackers might guess you are interested in that topic, even if you actually aren't.</p>
              </Text>
            </GridCol>
          </GridRow>
        </Grid>
      </TTPanel>
    )
  }

  exampleCluster () {
    return (
      <View>
        <Popover
          on='click'
          show={this.state.showPopover1}
          onDismiss={this.hidePopover1}
          label='Popover Example'
          offsetY='16px'
          mountNode={() => document.getElementById('main')}
        >
          <PopoverTrigger>
            <Button variant='circle-primary' onClick={this.showPopover1} margin='small' size='large'>
              <FontAwesomeIcon icon='paw' />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <View padding='medium' display='block' as='form' width={400}>
              {this.renderAppropCloseButton(1)}
              <Text>You might see an ad about dog clothes if you previously visited a blog about traveling with dogs. A third-party tracker on that blog could have guessed that you have an interest in dogs.</Text>
            </View>
          </PopoverContent>
        </Popover>

        <Popover
          on='click'
          show={this.state.showPopover2}
          onDismiss={this.hidePopover2}
          label='Popover Example'
          offsetY='16px'
          mountNode={() => document.getElementById('main')}
        >
          <PopoverTrigger>
            <Button variant='circle-primary' onClick={this.showPopover2} margin='small' size='large'>
              <FontAwesomeIcon icon='search' />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <View padding='medium' display='block' as='form' width={400}>
              {this.renderAppropCloseButton(2)}
              <Text>You want to know more about apples, the fruit, so you might search for "apple". However, if you often search for technical topics, you might see results for Apple, the tech company.</Text>
            </View>
          </PopoverContent>
        </Popover>

        <Popover
          on='click'
          show={this.state.showPopover3}
          onDismiss={this.hidePopover3}
          label='Popover Example'
          offsetY='16px'
          mountNode={() => document.getElementById('main')}
        >
          <PopoverTrigger>
            <Button variant='circle-primary' onClick={this.showPopover3} margin='small' size='large'>
              <FontAwesomeIcon icon='question' />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <View padding='medium' display='block' as='form' width={400}>
              {this.renderAppropCloseButton(3)}
              <Text>An advertiser might have decided to show ads for horror movies to people interested in sweaters. You recently searched for sweaters and jackets, so you see an ad for a horror movie even though you don't like horror movies.</Text>
            </View>
          </PopoverContent>
        </Popover>
      </View>
    )
  }

  renderLightbeamButton () {
    return (
      <GridRow>
        <GridCol>
          <TTPanel>
            <Button variant='primary' href='#/lightbeam'>
              See the trackers in your browsing
            </Button>
          </TTPanel>
        </GridCol>
      </GridRow>
    )
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()
    let args = {count: 5}

    const numPagesP = background.queryDatabase('getNumberOfPages', {})
    const numTrackersP = background.queryDatabase('getNumberOfTrackers', {})
    const numInferencesP = background.queryDatabase('getNumberOfInferences', {})
    const recentInferencesP = background.queryDatabase('getInferencesByTime', args)
    const topInferencesP = background.queryDatabase('getInferences', args)
    const recentDomainsP = background.queryDatabase('getDomains', args)
    const topTrackersP = background.queryDatabase('getTrackers', args)

    const [numPages, numTrackers, numInferences, recentInferences, topInferences, recentDomains, topTrackers] =
      await Promise.all([numPagesP, numTrackersP, numInferencesP, recentInferencesP, topInferencesP, recentDomainsP, topTrackersP])

    this.setState({
      numPages,
      numTrackers,
      numInferences,
      recentInferences,
      topInferences,
      recentDomains,
      topTrackers,
      ok: true
    })
  }

  async componentDidMount () {
    this.getData()
    // this.logLoad(); //will directly load it in App.js
  }

  render () {
    const { numTrackers, numInferences, numPages, recentInferences, recentDomains, topTrackers, topInferences, ok } = this.state
    const { hideHistoryContent, hideInferenceContent, hideTrackerContent, showLightbeam } = this.props

    return (
      <Grid startAt='medium'>
        <GridRow>
          <GridCol>
            {this.arrowPanel()}
            {/* {this.examplePanel()} */}
            {/* {meanForYouPanel()} */}

          </GridCol>
        </GridRow>
        <GridRow>
          {!hideTrackerContent && <GridCol width={3}>
            <TTPanel>
              {trackerList(topTrackers)}
            </TTPanel>
          </GridCol>}
          {!hideInferenceContent && <GridCol width={3}>
            <TTPanel>
              {inferenceTopList(topInferences)}
            </TTPanel>
          </GridCol>}
          {!hideHistoryContent && <GridCol width={6}>
            <TTPanel>
              <MetricsList theme={{lineHeight: 2}}>
                {!hideTrackerContent && <MetricsListItem value={numTrackers} label={<span><FontAwesomeIcon icon='eye' /> Trackers encountered</span>} />}
                <MetricsListItem value={numPages} label={<span><FontAwesomeIcon icon='window-maximize' /> Pages visited</span>} />
                {!hideInferenceContent && <MetricsListItem value={numInferences} label={<span><FontAwesomeIcon icon='thumbs-up' /> Potential interests</span>} />}
              </MetricsList>
            </TTPanel>

            {(numPages > 0 || numTrackers > 0) && <TTPanel margin='medium 0 0 0'>
              {!hideInferenceContent && numInferences > 0 &&
                <View
                  display='inline-block'
                  margin='small small small small'
                >
                  <View
                    as='header'
                    margin='0 0 small small'
                  >
                    <Text weight='bold'>Recent Interests</Text>
                  </View>
                  {recentInferences ? inferenceRecentList(recentInferences) : 'Loading…'}
                </View>
              }
              {numPages > 0 && <View
                display='inline-block'
                margin='small small small small'
              >
                <View
                  as='header'
                  margin='0 0 small small'
                >
                  <Text weight='bold'>Recent Sites</Text>
                </View>
                {recentDomains ? domainList(recentDomains) : 'Loading…'}
              </View>}
            </TTPanel>}
          </GridCol>}
        </GridRow>
        {showLightbeam && this.renderLightbeamButton()}
      </Grid>
    )
  }
}

export const WaitingDataHome = () => (
  <div>
    <Heading level='h1'><strong>{EXT.NAME}</strong></Heading>
    <TTPanel>
      <Text>
        <p>The {EXT.NAME} extension is currently running in the background to collect information about the trackers in your browsing.</p>
        <p>Continue using the internet and check back after you've browsed a few web pages.</p>
      </Text>
    </TTPanel>
  </div>
)
