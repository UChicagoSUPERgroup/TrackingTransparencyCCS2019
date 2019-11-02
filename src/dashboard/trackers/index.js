import React from 'react'
import { Route } from 'react-router-dom'

import TrackerOverview from './TrackerOverview'
import TrackerDetailPage from './TrackerDetailPage'

export default class Trackers extends React.Component {
  render () {
    const { hideInferenceContent } = this.props
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} render={props => (
          <TrackerDetailPage {...props}
            hideInferenceContent={hideInferenceContent}
          />
        )} />
        <Route exact path={this.props.match.url} render={props => (
          <TrackerOverview {...props}
            hideInferenceContent={hideInferenceContent}
          />
        )} />
      </div>
    )
  }
}
