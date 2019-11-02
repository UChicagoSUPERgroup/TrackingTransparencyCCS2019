import React from 'react'
import { SizeMe } from 'react-sizeme'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'
import IconArrowOpenEnd from '@instructure/ui-icons/lib/Solid/IconArrowOpenEnd'
import IconInfo from '@instructure/ui-icons/lib/Solid/IconInfo'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import InferenceSummary from './InferenceSummary'
import InferencesSunburst from './InferencesSunburst'
import TTPanel from '../components/TTPanel'

import logging from '../dashboardLogging'

export default class InferencesOverview extends React.Component {
  constructor (props) {
    super(props)
    this.inferenceCount = 100
    this.state = {
      selectedInference: false,
      inferences: null,
      sensitivitySelection: 'all-sensitive',
      popularitySelection: 'all-popular',
      dateSelection: 'all-dates',
      numInferences: null,
      exampleSite: '',
      exampleInference: '',
      exampleTracker: ''
    }

    this.handleSunburstSelection = this.handleSunburstSelection.bind(this)
    this.handleSensitivitySelection = this.handleSensitivitySelection.bind(this)
    this.handlePopularitySelection = this.handlePopularitySelection.bind(this)
    this.handleDateSelection = this.handleDateSelection.bind(this)
    this.handleInferenceLinkClick = this.handleInferenceLinkClick.bind(this)
  }

  async getInferences () {
    const background = await browser.runtime.getBackgroundPage()
    background.queryDatabase('getNumberOfInferences', {}).then(i => {
      this.setState({
        numInferences: i
      })
    })
    background.queryDatabase('getInferences', {count: this.inferenceCount}).then(i => {
      this.topInferences = i
      this.setState({
        inferences: i
      })
    })
  }

  async getExample () {
    let args = {count: 1}
    const background = await browser.runtime.getBackgroundPage()
    const example = await background.queryDatabase('getPagesByTime', args)
    args = {count: 1, domain: example[0].domain}
    const tracker = await background.queryDatabase('getTrackersByDomain', args)

    this.setState({
      exampleSite: example[0].domain,
      exampleInference: this.InferenceLink(example[0].inference),
      exampleTracker: tracker[0].name
    })
  }

  InferenceLink (inference) {
    return (
      <a className='inferencePageTopTextInferenceLink' onClick={this.handleInferenceLinkClick}>{inference}</a>
    )
  }

  handleInferenceLinkClick (e) {
    e.preventDefault()
    const inference = e.currentTarget.text
    this.setState({selectedInference: inference})
  }

  handleSunburstSelection (inference) {
    this.setState({selectedInference: inference})
  }

  async handleSensitivitySelection (event) {
    let cats
    const key = event.target.value
    const { comfortableCats, uncomfortableCats } = this.state

    this.setState({
      inferences: null
    })

    if (key === 'all-sensitive') {
      // reset to default
      this.setState({
        inferences: this.topInferences,
        selectedInference: false,
        sensitivitySelection: key,
        popularitySelection: 'all-popular',
        dateSelection: 'all-dates'
      })
      return
    } else if (key === 'less-sensitive') {
      cats = comfortableCats
    } else if (key === 'more-sensitive') {
      cats = uncomfortableCats
    }

    const background = await browser.runtime.getBackgroundPage()
    const queryPromises = cats.map(cat => {
      return background.queryDatabase('getInferenceCount', {inference: cat})
    })

    const counts = await Promise.all(queryPromises) // lets all queries happen async

    let data = []
    cats.forEach((cat, i) => {
      if (counts[i] > 0) {
        data.push({
          'inference': cat,
          'COUNT(inference)': counts[i]
        })
      }
    })

    this.setState({
      inferences: data,
      selectedInference: false,
      sensitivitySelection: key,
      popularitySelection: 'all-popular',
      dateSelection: 'all-dates'
    })
  }
  async handlePopularitySelection (event) {
    let cats
    const key = event.target.value
    const { popularCats, unpopularCats } = this.state

    this.setState({
      inferences: null
    })

    if (key === 'all-popular') {
      // reset to default
      this.setState({
        inferences: this.topInferences,
        selectedInference: false,
        sensitivitySelection: 'all-sensitive',
        popularitySelection: key,
        dateSelection: 'all-dates'
      })
      return
    } else if (key === 'less-popular') {
      cats = unpopularCats
    } else if (key === 'more-popular') {
      cats = popularCats
    }

    const background = await browser.runtime.getBackgroundPage()
    const queryPromises = cats.map(cat => {
      return background.queryDatabase('getInferenceCount', {inference: cat})
    })

    const counts = await Promise.all(queryPromises) // lets all queries happen async

    let data = []
    cats.forEach((cat, i) => {
      if (counts[i] > 0) {
        data.push({
          'inference': cat,
          'COUNT(inference)': counts[i]
        })
      }
    })

    this.setState({
      inferences: data,
      selectedInference: false,
      sensitivitySelection: 'all-sensitive',
      popularitySelection: key,
      dateSelection: 'all-dates'
    })
  }

  async handleDateSelection (event) {
    let afterDate
    const key = event.target.value

    this.setState({
      inferences: null
    })

    const background = await browser.runtime.getBackgroundPage()

    if (key === 'all-dates') {
      // reset to default
      afterDate = 0
    } else if (key === 'past-24') {
      afterDate = Date.now() - 86400000
    } else if (key === 'past-week') {
      afterDate = Date.now() - 86400000 * 7
    // } else if (key === 'past-month') {
    //   afterDate = Date.now() - 86400000 * 7 * 30
    }

    const data = await background.queryDatabase('getInferences', {count: this.inferenceCount, afterDate: afterDate})

    this.setState({
      inferences: data,
      selectedInference: false,
      sensitivitySelection: 'all-sensitive',
      popularitySelection: 'all-popular',
      dateSelection: key
    })
  }

  async componentDidMount () {
    let activityType = 'load dashboard Interests page'
    logging.logLoad(activityType, {})
    this.getInferences()
    this.getExample()
    const interests = (await import(/* webpackChunkName: "data/sensitiveCats" */'../../data/interests/interests.json')).default
    let comfortableCats = []
    let uncomfortableCats = []
    let popularCats = []
    let unpopularCats = []
    for (let i in interests) {
      const interest = interests[i]
      if (interest.impressions) {
        if (interest.impressions >= 1000000000) {
          popularCats.push(i)
        } else if (interest.impressions <= 1000000000) {
          unpopularCats.push(i)
        }
      }
      if (interest.comfort) {
        if (interest.comfort >= 1) {
          comfortableCats.push(i)
        } else if (interest.comfort <= -1) {
          uncomfortableCats.push(i)
        }
      }
    }
    console.log(comfortableCats, uncomfortableCats, popularCats, unpopularCats)
    this.setState({ comfortableCats, uncomfortableCats, popularCats, unpopularCats })
  }

  render () {
    let { inferences, selectedInference, numInferences } = this.state
    let { exampleSite, exampleInference, exampleTracker } = this.state
    const ok = numInferences > 0
    const nodata = numInferences === 0

    const popularityTooltipText = (
      <div style={{width: 160}}>
        Toggle between these filters to show only interests that are more or less popular.
      </div>
    )

    const popularityTooltip = (<span>
      Popularity
      <Tooltip
        tip={popularityTooltipText}
        variant='inverse'
        placement='end'
      >
        &nbsp;<IconInfo />
      </Tooltip>
    </span>)

    const sensitivityTooltipText = (
      <div style={{width: 160}}>
        Our research has found that people are more or less comfortable with some interests being inferred about them.
        Toggle between these filters to show only interests that other users are more or less comfortable with.
      </div>
    )

    const sensitivityTooltip = (<span>
      Comfort
      <Tooltip
        tip={sensitivityTooltipText}
        variant='inverse'
        placement='end'
      >
        &nbsp;<IconInfo />
      </Tooltip>
    </span>)

    const recencyTooltipText = (
      <div style={{width: 160}}>
        Toggle between these filters to show interests made only in the last day, or only in the last week.
      </div>
    )

    const recencyTooltip = (<span>
      Recency
      <Tooltip
        tip={recencyTooltipText}
        variant='inverse'
        placement='end'
      >
        &nbsp;<IconInfo />
      </Tooltip>
    </span>)

    const filters = (
      <TTPanel
        textAlign='start'
        className={'inferences-sunburst-filters'}
        margin='medium 0 0 0'
      >
        <Heading level='h3' margin='0 0 small 0'>Filters</Heading>
        <div style={{marginRight: -200, overflow: 'hidden'}}>
          <RadioInputGroup
            name='date-filter'
            value={this.state.dateSelection}
            onChange={this.handleDateSelection}
            description={recencyTooltip}
            variant='toggle'
            layout='inline'
            size='small'
          >
            <RadioInput label='All' value='all-dates' context='off' />
            <RadioInput label='24 hrs' value='past-24' context='off' />
            <RadioInput label='7 days' value='past-week' context='off' />
            {/* <RadioInput label='Last month' value='past-month' context='off' /> */}
          </RadioInputGroup>
          <RadioInputGroup
            name='popularity-filter'
            value={this.state.popularitySelection}
            onChange={this.handlePopularitySelection}
            description={popularityTooltip}
            variant='toggle'
            layout='inline'
            size='small'
          >
            <RadioInput label='All' value='all-popular' context='off' />
            <RadioInput label='Less' value='less-popular' context='off' />
            <RadioInput label='More' value='more-popular' context='off' />
          </RadioInputGroup>
          <RadioInputGroup
            name='sensitivity-filter'
            value={this.state.sensitivitySelection}
            onChange={this.handleSensitivitySelection}
            description={sensitivityTooltip}
            variant='toggle'
            layout='inline'
            size='small'
          >
            <RadioInput label='All' value='all-sensitive' context='off' />
            {/* yes, this is what we want, less comfortable === more sensitive */}
            <RadioInput label='Less' value='more-sensitive' context='off' />
            <RadioInput label='More' value='less-sensitive' context='off' />
          </RadioInputGroup>
        </div>
      </TTPanel>
    )

    return (
      <Grid startAt='medium'>
        <GridRow>
          <GridCol>
            <Heading level='h1'><FontAwesomeIcon icon='thumbs-up' /><strong>&nbsp; What interests might they think you have?</strong></Heading>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <TTPanel>
              <Text>
                <p>Trackers collect information about the pages you visit and use this information to identify topics, or <em>interests</em>, that might be relevant to you. These interests are then used to target ads to you and personalize what you see online. Companies don't usually reveal how they determine your potential interests. Based on the pages you visited, {EXT.NAME}'s simulations have identified <strong>{numInferences} topics</strong> trackers might think are relevant to you.</p>
                {exampleSite && <p>For example, you recently visited <Link href={'#/sites/' + exampleSite}>{exampleSite}</Link>, which {EXT.NAME} has determined may be about {exampleInference}.</p>}
                {ok && <p>The chart below shows the interests suggested by your browsing activity. Click a slice of the chart to see more details.</p>}
                {nodata && <p>Return to this page after viewing a few sites to see what may have been inferred about your interests.</p>}
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
        {<GridRow>
          <GridCol width={7}>
            <TTPanel padding='0 0 0 0'>
              <SizeMe>
                {({ size }) => {
                  if (inferences) {
                    return (
                      <InferencesSunburst
                        inferenceCounts={inferences}
                        onSelectionChange={this.handleSunburstSelection}
                        selectedInference={selectedInference}
                        height={size.width}
                        width={size.width}
                      />
                    )
                  } else {
                    return (
                      <div
                        style={{
                          height: size.width,
                          width: size.width,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Spinner title='Sunburst loading…' size='large' />
                      </div>
                    )
                  }
                }}
              </SizeMe>
            </TTPanel>
          </GridCol>
          <GridCol width={5}>
            <TTPanel textAlign='start'>
              {!selectedInference && <Text className='selected-inference' weight='bold'>
                 Click a slice of the chart to see what trackers think you might be interested in. </Text>}
              {selectedInference && <div>
                <InferenceSummary inference={selectedInference} />
                <Link
                  className='inferencePageSelected-Inference'
                  href={'#/interests/' + selectedInference}
                  icon={IconArrowOpenEnd}
                  iconPlacement='end'
                >
                    More about this interest
                </Link>
              </div>}
            </TTPanel>
            {filters}
          </GridCol>
        </GridRow>}
      </Grid>
    )
  }
}
