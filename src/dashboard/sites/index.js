import React from 'react'
import { Route } from 'react-router-dom'

import SiteOverview from './SiteOverview'
import SiteDetailPage from './SiteDetailPage'

export default class Sites extends React.Component {
  render () {
    const { hideInferenceContent, hideTrackerContent } = this.props
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} render={props => (
          <SiteDetailPage {...props}
            hideInferenceContent={hideInferenceContent}
            hideTrackerContent={hideTrackerContent}
          />
        )} />
        <Route exact path={this.props.match.url} render={props => (
          <SiteOverview {...props}
            hideInferenceContent={hideInferenceContent}
            hideTrackerContent={hideTrackerContent}
          />
        )} />
      </div>

    )
  }
}
