import React from 'react'
import ReactDOM from 'react-dom'

import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Button from '@instructure/ui-buttons/lib/components/Button'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import View from '@instructure/ui-layout/lib/components/View'

const SpecialButton = ({ title, children, onClick }) => (
  <ToggleGroup
    summary={title}
    toggleLabel={title}
  >
    <View display='block' padding='small'>
      <Text>{children}</Text>
      <Button variant='danger' onClick={onClick}>{title}</Button>
    </View>
  </ToggleGroup>
)

export default class Options extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showOverlay: true
    }

    this.checkboxChangeHandler = this.checkboxChangeHandler.bind(this)
    this.setOption = this.setOption.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
    this.optOutOnClick = this.optOutOnClick.bind(this)
  }

  checkboxChangeHandler (e) {
    let name = e.target.value
    let state = e.target.checked
    this.setOption(name, state)
  }

  async setOption (name, state) {
    await this.setState({ [name]: state })
    browser.storage.local.set({ options: this.state })
  }

  async loadOptions () {
    const store = await browser.storage.local.get(['options', 'mturkcode'])
    const options = store.options
    const mturkcode = store.mturkcode
    this.setState({
      ...options,
      id: mturkcode
    })
  }

  async componentDidMount () {
    this.loadOptions()
  }

  async resetOnClick () {
    const background = await browser.runtime.getBackgroundPage()
    await background.resetAllData()
  }

  optOutOnClick () {
    const { id } = this.state
    fetch('https://super.cs.uchicago.edu/trackingtransparency/removedata.php?userId=' + id)
      .then(browser.management.uninstallSelf({ showConfirmDialog: true }))
      .then(null, () => this.setState({alert: 'Uninstallation failed. Please uninstall the extension manually.'}))
  }

  resetInfo () {
    return (
      <SpecialButton
        variant='danger'
        onClick={this.resetOnClick}
        title='Reset all data'
      >
        <p>If you wish to reset all data currently being stored by {EXT.NAME}, click the button below. This will reset the data locally stored on your computer but the extension will remain installed.</p>
      </SpecialButton>
    )
  }

  optOutInfo () {
    return (
      <SpecialButton
        variant='danger'
        onClick={this.optOutOnClick}
        title='Opt out of study'
      >
        <p>You can stop participating at any time by clicking on the button. This will mark your data for deletion on our servers, and also uninstall the extension.</p>
      </SpecialButton>
    )
  }
  render () {
    const { id, alert } = this.state
    return (
      <div>
        {alert && <Text><strong>{alert}</strong></Text>}
        {id && id.split('-')[0] === '4' && <div>
          <Heading level='h2' margin='medium 0 medium 0'>Display options</Heading>
          <Checkbox
            value='showOverlay'
            label='Show in-page overlay'
            checked={this.state.showOverlay}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
        </div>}
        <Heading level='h2' margin='medium 0 medium 0'>Danger zone</Heading>
        {this.resetInfo()}
        {/* {this.optOutInfo()} */}
        {/* <Text>
          <p><strong>User ID: {id}</strong></p>
        </Text> */}
      </div>
    )
  }
}
