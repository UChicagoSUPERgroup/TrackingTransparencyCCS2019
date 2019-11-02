import React from 'react'
import Breadcrumb from '@instructure/ui-breadcrumb/lib/components/Breadcrumb'
import BreadcrumbLink from '@instructure/ui-breadcrumb/lib/components/Breadcrumb/BreadcrumbLink'
import View from '@instructure/ui-layout/lib/components/View'
import { darken } from '@instructure/ui-themeable/lib/utils/color'

import colors from '../../colors'

const urlComponentMapping = {
  '': 'Home',
  interests: 'Interests',
  sites: 'Sites',
  trackers: 'Trackers',
  activity: 'Activity',
  lightbeam: 'Network',
  about: 'About',
  settings: 'Settings',
  takeaction: 'Take Action',
  debug: 'Debug',
  privacypolicy: 'Privacy Policy'
}

export default class TTBreadcrumbs extends React.Component {
  urlToArray (rawurl) {
    let url

    // strip off trailing /
    if (rawurl.endsWith('/')) {
      url = rawurl.slice(0, -1)
    } else {
      url = rawurl
    }

    // special handling for home
    if (url === '') {
      return [{
        name: 'Home',
        path: '#/'
      }]
    }

    const arr = url.split('/')
    let incPath = '#'
    const names = arr.map(x => {
      let name
      if (urlComponentMapping[x]) {
        name = urlComponentMapping[x]
      } else {
        name = x
      }
      incPath += x + '/'
      return {
        name: name,
        path: incPath
      }
    })
    return names
  }

  render () {
    let names = this.urlToArray(this.props.url)
    return (
      <div
        style={{
          background: darken(colors.ltGray, 5),
          padding: '8px 10px 8px 10px',
          margin: '10px 0 25px 0',
          borderRadius: 5
        }}
      >
        <Breadcrumb label='You are here:'>
          {names.map((x, i, arr) => {
            if (i === arr.length - 1) {
              return <BreadcrumbLink key={x.name}>{x.name}</BreadcrumbLink>
            } else {
              return <BreadcrumbLink href={x.path} key={x.name}>{x.name}</BreadcrumbLink>
            }
          })}
        </Breadcrumb>
      </div>
    )
  }
}
