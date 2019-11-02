import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'

class IFrame extends React.Component {
  // https://stackoverflow.com/a/33915153
  constructor (props) {
    super(props)

    this.styles = {
      border: 'none',
      margin: 0,
      padding: 0,
      display: 'block',
      width: '100%',
      height: '700px'
    }
  }

  render () {
    return (
      <div>
        <iframe src={this.props.src} style={this.styles} className='lightbeam-iframe' />
      </div>
    )
  }
}

export default class LightbeamWrapper extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    // this.logLoad = this.logLoad.bind(this);
  }

  async componentDidMount () {
    let activityType = 'load lightbeam page'
    logging.logLoad(activityType, {})
  }

  render () {
    return (
      <div>
        <Heading level='h1'>Tracker Network</Heading>
        <TTPanel margin='medium 0 medium 0'>
          <Text>
            <p>This page is a visualization of the connections between the first and third party sites you have interacted with on the Web.</p>
            <p>The web below is interactive: click and drag on icons to try to untangle the web!</p>
            <p>A circle icon represents a site that you have visted, and a triangle icon represents a third party that has seen you online. </p>
            <ul>
              <li>A circle icon with many connections is a site you have visited that has lots of third party sites active on it.</li>
              <li>A triangle icon with many connections is a third party site that has seen you on many different sites online.</li>
            </ul>
          </Text>
        </TTPanel>
        <TTPanel margin='medium 0 medium 0' padding='0 0 0 0'>
          <IFrame src={browser.runtime.getURL('lightbeam/index.html')} />
        </TTPanel>
      </div>
    )
  }
}
