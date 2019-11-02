import React from 'react'

import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'

import { setUserstudyCondition } from './userstudy'

export default class UserstudyOptionsUI extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showDashboard: true,
      showOverlay: true,
      showLightbeam: true,
      showTrackerContent: true,
      showInferenceContent: true,
      showHistoryContent: true,
      // popupVariant: 'default',
      userstudyCondtion: 'everything'
    }

    this.fieldChangeHandler = this.fieldChangeHandler.bind(this)
    this.checkboxChangeHandler = this.checkboxChangeHandler.bind(this)
    this.userstudySelectHandler = this.userstudySelectHandler.bind(this)
    this.setOption = this.setOption.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
  }

  fieldChangeHandler (e) {
    let name = e.target.name
    let state = e.target.value
    this.setOption(name, state)
  }

  checkboxChangeHandler (e) {
    let name = e.target.value
    let state = e.target.checked
    this.setOption(name, state)
  }

  async userstudySelectHandler (e) {
    const state = e.target.value
    const newOptions = await setUserstudyCondition(state)
    this.setState({ ...newOptions })
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

  render () {
    const id = this.state.id
    return (
      <div>
        <Text>
          <p><strong>User ID: {id}</strong></p>
          <p><Link href='/dist/welcome.html'>Open welcome page</Link></p>
        </Text>
        <FormFieldGroup
          name='displayOptions'
          description='Display options'
          vAlign='top'
          rowSpacing='small'
        >
          <Checkbox
            value='showDashboard'
            label='Show dashboard'
            checked={this.state.showDashboard}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
          <Checkbox
            value='showOverlay'
            label='Show in-page overlay'
            checked={this.state.showOverlay}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
          <Checkbox
            value='showLightbeam'
            label='Show Lightbeam'
            checked={this.state.showLightbeam}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
          <Checkbox
            value='showTrackerContent'
            label='Show tracker content'
            checked={this.state.showTrackerContent}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
          <Checkbox
            value='showInferenceContent'
            label='Show inference content'
            checked={this.state.showInferenceContent}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
          <Checkbox
            value='showHistoryContent'
            label='Show history content'
            checked={this.state.showHistoryContent}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
        </FormFieldGroup>
        <br />
        {/* <RadioInputGroup
          name='popupVariant'
          description='Popup variant'
          value={this.state.popupVariant}
          onChange={this.fieldChangeHandler}
          variant='toggle'
          layout='inline'
        >
          <RadioInput label='Default' value='default' />
          <RadioInput label='Static' value='static' context='off' />
          <RadioInput label='Ghostery' value='ghostery' context='off' />
        </RadioInputGroup> */}
        <RadioInputGroup
          name='userstudyCondition'
          description='User study condition'
          value={this.state.userstudyCondition}
          onChange={this.userstudySelectHandler}
        >
          <RadioInput value='staticExplanations' label='First Control -- Static explanations of OBA' />
          <RadioInput value='historyOnly' label='Second Control -- Non-OBA visualization of browsing history' />
          <RadioInput value='lightbeam' label='Lightbeam' />
          <RadioInput value='ghostery' label='Ghostery/Disconnect without longitudinal info' />
          <RadioInput value='noInferences' label='Everything minus inferences' />
          <RadioInput value='everything' label='Everything' />
        </RadioInputGroup>
      </div>
    )
  }
}
