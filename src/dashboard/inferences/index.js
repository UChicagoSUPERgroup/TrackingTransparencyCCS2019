import React from 'react'
import { Route } from 'react-router-dom'

import InferenceOverview from './InferenceOverview'
import InferenceDetailPage from './InferenceDetailPage'

export default class Inferences extends React.Component {
  render () {
    return (
      <div>
        <Route path={`${this.props.match.url}/:name`} component={InferenceDetailPage} />
        <Route exact path={this.props.match.url} component={InferenceOverview} />
      </div>
    )
  }
}
