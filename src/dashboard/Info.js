import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'

export default class InfoPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.loadID = this.loadID.bind(this)
  }

  componentDidMount () {
    let activityType = 'load dashboard About page'
    logging.logLoad(activityType, {})

    this.loadID()
  }

  async loadID () {
    const store = await browser.storage.local.get('mturkcode')
    const extensionID = store.mturkcode
    this.setState({ id: extensionID })
  }

  render () {
    const id = this.state.id
    const { hideTrackerContent, hideInferenceContent } = this.props
    return (
      <Grid>
        <GridRow>
          <GridCol>
            <Heading level='h1'><strong>About</strong></Heading>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Heading level='h2'>How the extension works</Heading>
              <Text>
                <p>{EXT.NAME} is a browser extension that helps you better understand your web browsing and how web trackers and advertisers work.</p>
                {!hideTrackerContent && <p>When you load web pages, your browser requests many third-party resources, some of which are from tracking companies and ad networks. We determine which of these requests are from trackers using Disconnect's open-source  <a href='https://disconnect.me/trackerprotection/blocked' target='_blank' rel='noopener noreferrer'>list of known trackers</a>. Unlike other ad or tracker blockers you might use, this extension does <em>not</em> block ads or otherwise change any aspect of your browsing. Instead, this extension reveals where and when you have encountered these trackers.</p>}
                {!hideInferenceContent && <p>{EXT.NAME} also makes guesses about what trackers could have learned about you. Many trackers operate by collecting information about you and your interests and selling this data to other entities. This extension has a built-in algorithm to guess the topic of a web page based on the content. It then uses this information to help you understand what trackers could know about you.</p>}
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Heading level='h2'>Your privacy</Heading>
              <Text>
                <p>
                  The data that {EXT.NAME} collects about you is stored in your local browser. Personally identifiable data about you is never sent to another server, so not even the researchers and developers of {EXT.NAME} have access to personally identifiable information.
                </p>
                <p>
                  To learn more, please read our <a href='https://super.cs.uchicago.edu/trackingtransparency/privacy.html' target='_blank' rel='noopener noreferrer'>privacy policy</a>.
                </p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Heading level='h2'>Who we are</Heading>
              <Text>
                <p>The {EXT.NAME} extension was built by a research collaboration between researchers at the University of Chicago and University of Maryland. The project is advised by Professor Blase Ur at the University of Chicago and Professor Michelle Mazurek at the University of Maryland.</p>
                <p>Should you have any questions about the extension or our associated research, you may email the research team at <Link href='mailto:trackingtransparency@super.cs.uchicago.edu'>trackingtransparency@lists.uchicago.edu</Link>.</p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
        {/* <GridRow>
          <GridCol>
            <Text><p><em>User ID: {id}</em></p></Text>
          </GridCol>
        </GridRow> */}
      </Grid>
    )
  }
}
