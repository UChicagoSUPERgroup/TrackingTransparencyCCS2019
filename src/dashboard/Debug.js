import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Alert from '@instructure/ui-alerts/lib/components/Alert'
import Button from '@instructure/ui-buttons/lib/components/Button'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'
import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import TextArea from '@instructure/ui-forms/lib/components/TextArea'
import TextInput from '@instructure/ui-forms/lib/components/TextInput'
import DateInput from '@instructure/ui-forms/lib/components/DateInput'
import NumberInput from '@instructure/ui-forms/lib/components/NumberInput'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'
import UserstudyOptionsUI from '../options/UserstudyOptionsUI'

class DebugPage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      queryFormField: '',
      trackerFormField: 'Google',
      domainFormField: 'yahoo.com',
      inferenceFormField: 'Computers & Electronics',
      afterDateFormField: '',
      countFormField: '',
      importFormField: '',
      result: false,
      error: false,
      queryTime: false
    }
    this.recursive = false

    this.handleChange = this.handleChange.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.saveFile = this.saveFile.bind(this)
    this.importData = this.importData.bind(this)
    this.handleClickRecursive = this.handleClickRecursive.bind(this)
    // this.logLoad = this.logLoad.bind(this);
  }

  componentDidMount () {
    let activityType = 'load dashboard debug page'
    logging.logLoad(activityType, {})
  }
  async handleClickRecursive () {
    this.recursive = true
    await this.handleClick()
    this.recursive = false
  }

  async handleClick () {
    const background = await browser.runtime.getBackgroundPage()
    const query = this.state.queryFormField
    const queryObj = {
      tracker: this.state.trackerFormField,
      domain: this.state.domainFormField,
      inference: this.state.inferenceFormField,
      afterDate: (new Date(this.state.afterDateFormField)).getTime(),
      count: this.state.countFormField
    }
    console.log('making query', query, queryObj)
    try {
      let t0 = performance.now()
      let result
      if (this.recursive) {
        console.log('making recursive query')
        result = await background.queryDatabaseRecursive(query, queryObj)
      } else {
        result = await background.queryDatabase(query, queryObj)
      }
      let t1 = performance.now()
      console.log(result)
      this.setState({
        result: result,
        error: false,
        queryTime: t1 - t0
      })
    } catch (e) {
      console.log(e)
      this.setState({
        result: false,
        error: e.message
      })
    }
  }

  saveFile () {
    let blob = new Blob([JSON.stringify(this.state.result, null, '\t')], {type: 'application/json'})
    var objectURL = window.URL.createObjectURL(blob)
    browser.downloads.download({url: objectURL, filename: 'tt_export.json'})
    // FileSaver.saveAs(blob, 'tt_export.json');
  }

  async importData () {
    const background = await browser.runtime.getBackgroundPage()
    await background.importData(this.state.importFormField)
  }

  async resetAll () {
    const background = await browser.runtime.getBackgroundPage()
    await background.resetAllData()
  }

  handleChange (e) {
    const value = e.target.value
    const name = e.target.id
    console.log(name, value)
    this.setState({
      [name]: value
    })
  }

  handleTextChange (e) {
    const value = e.target.value
    const name = e.target.name
    // console.log(name, value)
    this.setState({
      [name]: value
    })
  }

  render () {
    const {result, error, queryTime} = this.state
    return (
      <div>
        <Heading level='h1' margin='0 0 medium'><strong>Debug</strong></Heading>
        <TTPanel margin='medium 0 medium 0'>
          <Heading level='h2' margin='0 0 medium'>Database query</Heading>
          <FormFieldGroup
            name='query'
            description='Make a database query'
            layout='columns'
            vAlign='top'
            rowSpacing='small'
          >
            <TextInput
              name='queryFormField'
              label='Query'
              placeholder='getAllData'
              value={this.state.queryFormField}
              onChange={this.handleTextChange}
            />
            <TextInput
              name='trackerFormField'
              label='Tracker'
              placeholder='Google'
              value={this.state.trackerFormField}
              onChange={this.handleTextChange}
            />
            <TextInput
              name='domainFormField'
              label='First party domain'
              placeholder='yahoo.com'
              value={this.state.domainFormField}
              onChange={this.handleTextChange}
            />
            <TextInput
              name='inferenceFormField'
              label='Inference'
              placeholder='Warehousing'
              value={this.state.inferenceFormField}
              onChange={this.handleTextChange}
            />
            <DateInput
              previousLabel='previous month'
              nextLabel='next month'
              placeholder='Start date'
              label='Start date'
              dateValue={this.state.afterDateFormField}
              onDateChange={(e, isoValue, rawValue, rawConversionFailed) => { this.setState({afterDateFormField: isoValue.slice(0, 10)}) }}
              invalidDateMessage={(value) => { return `'${value}' is not a valid date` }}
            />
            <NumberInput
              label='Number of results'
              placeholder='12'
              min={1}
              step={1}
              value={this.state.countFormField}
              onChange={(e, num) => this.setState({ countFormField: num })}
            />
          </FormFieldGroup>
          <Button variant='primary' type='submit' onClick={this.handleClick} margin='small small 0 0'>
            Query
          </Button>
          <Button type='submit' onClick={this.handleClickRecursive} margin='small 0 0 0'>
            Query (recursive on inferences)
          </Button>
          {error && <Alert
            variant='error'
            closeButtonLabel='Close'
            margin='small'
          >
            {error}
          </Alert>}
          {result && <div>
            <pre id='result' style={{ overflow: 'scroll', maxHeight: '20rem', border: '1px solid black' }}>
              {JSON.stringify(this.state.result, null, '\t')}
            </pre>

            <Button type='submit' onClick={this.saveFile}>
              Download
            </Button>
          </div>}
          {queryTime && <p>Time: {queryTime / 1000} seconds</p>}
        </TTPanel>

        <TTPanel margin='medium 0 medium 0'>
          <Heading level='h2' margin='0 0 medium'>Import data</Heading>
          <TextArea
            name='importFormField'
            label='JSON to import'
            placeholder='Paste here'
            maxHeight='30rem'
            value={this.state.importFormField}
            onChange={this.handleTextChange}
          />
          <br />
          <Button type='submit' onClick={this.importData}>
          Import data
          </Button>
        </TTPanel>

        <TTPanel margin='medium 0 medium 0'>
          <Heading level='h2' margin='0 0 medium'>User study settings</Heading>
          <UserstudyOptionsUI />
        </TTPanel>

        <TTPanel margin='medium 0 medium 0'>
          <ToggleDetails
            summary='Danger zone'
          >
            <Button
              variant='danger'
              type='submit'
              onClick={this.resetAll}>
            Reset all data
            </Button>
          </ToggleDetails>
        </TTPanel>
      </div>
    )
  }
}

export default DebugPage
