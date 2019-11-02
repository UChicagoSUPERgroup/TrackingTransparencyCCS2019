import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Link from '@instructure/ui-elements/lib/components/Link'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import View from '@instructure/ui-layout/lib/components/View'
import Button from '@instructure/ui-buttons/lib/components/Button'
import Alert from '@instructure/ui-alerts/lib/components/Alert'

// import Table from '@instructure/ui-elements/lib/components/Table'
// import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
// import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

import logging from '../dashboard/dashboardLogging'
import { themeOverrides } from '../colors'
import { generateID, saveID } from '../options/userstudy'
import tt from '../helpers'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
library.add(faCheckSquare, faSquare)

theme.use({ overrides: themeOverrides })

const styles = {}

styles.container = {
  width: '90%',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

class WelcomePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.toggleExtensionEnabled = this.toggleExtensionEnabled.bind(this)
    this.onSave = this.onSave.bind(this)
  }

  async componentDidMount () {
    const background = await browser.runtime.getBackgroundPage()
    // const adblockers = await background.getAdblockers()
    // this.setState({ adblockers })
    const { mturkcode } = await browser.storage.local.get('mturkcode')
    let id
    if (mturkcode) {
      id = mturkcode
    } else {
      id = await generateID()
    }
    await saveID(id)
    this.setState({ id })
    this.renderOverlayInfo = this.renderOverlayInfo.bind(this)
  }

  async onSave () {
    const id = this.state.id
    window.location.href = 'https://umdsurvey.umd.edu/jfe/form/SV_6ywfM4gHdHX8UJv?id=' + id
  }

  async toggleExtensionEnabled (e) {
    const id = e.target.value
    const checked = e.target.checked
    const background = await browser.runtime.getBackgroundPage()
    await background.setExtEnabled(id, checked)
    const adblockers = await background.getAdblockers()
    this.setState({ adblockers })
  }

  renderOverlayInfo () {
    const id = this.state.id || '6'
    const cond = (id.split('-')[0])
    if (cond === '4') { // ghostery condition
      return (<div>
        <p>{EXT.NAME} will load an overlay on each page with the current tracker as displayed below. If you wish to disable the overlay you may do so in your browser's extension options page.</p>
        <img src='/icons/overlay.png' width='700px' style={{border: '1px solid black'}} />
      </div>)
    }
    return null
  }

  // renderAdblockTable () {
  //   const { adblockers } = this.state
  //   if (!adblockers || adblockers.length === 0) {
  //     return null
  //   }

  //   return (
  //     <div>
  //       <Heading margin='large 0 medium 0'>Conflicting extensions</Heading>
  //       <Text>
  //         This extension works by collecting information about which trackers and advertisments are on the web pages you visit. As such, having an ad blocker or tracker blocker installed can prevent our extension from collecting the data needed to visualize your web browsing.
  //         {!isFirefox && ' We have detected that you have the following ad or tracker blockers enabled, and recommend that you disable them using the switches below.'}
  //         {isFirefox && ' We have detected that you have the following ad or tracker blockers enabled, and recommend that you disable them on the add-ons settings page.'}
  //       </Text>
  //       <Table
  //         caption={<ScreenReaderContent>Installed ad or tracker blockers</ScreenReaderContent>}
  //       >
  //         <thead>
  //           <tr>
  //             <th scope='col'>Name</th>
  //             {!isFirefox && <th scope='col'>Enabled</th>}
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {adblockers.map(ext => (
  //             <tr key={ext.id}>
  //               <td>{ext.name}</td>
  //               {!isFirefox && <td>
  //                 <Checkbox
  //                   label={<ScreenReaderContent>Checkbox to enable/disable {ext.name}</ScreenReaderContent>}
  //                   value={ext.id}
  //                   checked={ext.enabled}
  //                   onChange={this.toggleExtensionEnabled}
  //                   variant='toggle'
  //                 />
  //               </td>}
  //             </tr>
  //           ), this)}
  //         </tbody>
  //       </Table>
  //       {isFirefox && <Text><p>You can disable these add-ons by clicking on the <strong>menu icon</strong> in the top-right corner of your browser window, then clicking <strong>Add-ons</strong>. When the add-ons page opens, click on the <strong>Add-ons</strong> section on the left, and then find the add-ons listed above and clicking <strong>Disable</strong> for each of them.</p></Text>}
  //     </div>
  //   )
  // }

  render () {
    return (
      <div>
        <div className='container' style={styles.container}>
          <img src='/icons/super.svg' height='120px' />
          <img src='/icons/umd.gif' height='120px' />

          <Heading margin='large 0 medium 0' border='bottom'>About this extension</Heading>
          <Text>
            <p>{EXT.NAME} is a software tool that visualizes aspects of your web browsing. To access this extension, click on the icon in the corner of the upper right of your browser window. </p>
            <img src='/icons/extension-toolbar.png' width='700px' style={{border: '1px solid black'}} />
            <p>The extension icon will appear in the upper right corner for Chrome as well as Firefox users. </p>
            {this.renderOverlayInfo()}
          </Text>
          {/* <Heading margin='large 0 medium 0' border='bottom'>Our study</Heading>
          <Text>
            <p>There are two parts to this study.</p>
            <Grid hAlign="space-around">
              <GridRow>
                <GridCol>
                  <View as='div' borderWidth='medium' borderRadius='medium' padding='small'>
                    <Heading level='h3' margin='0 small small 0'>Part 1</Heading>
                    <Text>
                      <p><strong>When</strong>: now</p>
                      <p><strong>Steps</strong>:</p>
                      <p style={{'marginLeft':'1em'}}>
                        <FontAwesomeIcon icon='check-square'/> Install extension<br/>
                        <FontAwesomeIcon icon='square'/> Complete Survey 1 (15 mins.)<br/>
                      </p>
                      <p><strong>Compensation</strong>: $3.00</p>
                    </Text>
                  </View>
                </GridCol>
                <GridCol>
                  <View as='div' borderWidth='medium' borderRadius='medium' padding='small'>
                    <Heading level='h3' margin='0 small small 0'>Part 2</Heading>
                    <Text>
                      <p><strong>When</strong>: in one week, you will be contacted via MTurk</p>
                      <p><strong>Steps</strong>:</p>
                      <p style={{'marginLeft':'1em'}}>
                        <FontAwesomeIcon icon='square'/> Complete Survey 2 (20 mins.)<br/>
                        <FontAwesomeIcon icon='square'/> Remove extension from your browser<br/>
                      </p>
                      <p><strong>Compensation</strong>: $7.00</p>
                    </Text>
                  </View>
                </GridCol>
              </GridRow>
              <GridRow>
                <GridCol>
                  <Alert variant='warning'>
                    You must keep the extension installed until you complete Survey 2. If you uninstall and re-install the extension, your data will no longer be valid and payment for Part 2 will <em>not</em> be processed.
                  </Alert>
                </GridCol>
              </GridRow>
            </Grid>
          </Text> */}
          <Heading margin='large 0 medium 0' border='bottom'>Data collection</Heading>
          <Text>
            <p>To enable its visualizations, the extension will store data on your computer about your web browsing.</p>
            <p>Personally-identifiable information will <em>not</em> leave your computer and will <em>not</em> be shared with the researchers.</p>
            {/* The software will, however, collect for the researchers certain anonymized metrics, including:</p>
            <ul>
              <li>descriptions of the topics of webpages you visit (e.g., “entertainment” or “computer hardware”)</li>
              <li>the number of different websites you visit, but not which specific websites</li>
              <li>how you interact with the browser extension</li>
            </ul>
            <p>Full information about the data collected by the extension and how we will use it is available in our <Link href='https://super.cs.uchicago.edu/trackingtransparency/privacy.html' target='_blank'>privacy policy</Link>.</p> */}
          </Text>
          {/* <Button variant='primary' onClick={this.onSave}><Heading margin='medium'>Begin Survey 1</Heading></Button> */}
        </div>

      </div>
    )
  }
}

ReactDOM.render(<WelcomePage />, document.getElementById('root'))
