import React from 'react'

import Button from '@instructure/ui-buttons/lib/components/Button'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'
import Options from '../options/OptionsUI'

// function onCanceled(error) {
//   console.log(`Canceled: ${error}`);
// }
//

export class SettingsPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  async componentDidMount () {
    let activityType = 'load dashboard settings page'
    logging.logLoad(activityType, {})
  }

  render () {
    return (
      <div>
        <Heading level='h1'><strong>Settings</strong></Heading>
        <TTPanel margin='medium 0 medium 0'>
          <Options />
        </TTPanel>
      </div>
    )
  }
}

export default SettingsPage
