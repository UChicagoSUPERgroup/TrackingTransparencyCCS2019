import React from 'react'
import ReactTable from 'react-table'
import * as moment from 'moment'

import Link from '@instructure/ui-elements/lib/components/Link'
import TruncateText from '@instructure/ui-elements/lib/components/TruncateText'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class PageTable extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      title: props.title,
      data: this.sortData(props.data, props.sortAscending)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.sortData(this.props.data, this.props.sortAscending) })
    }
    if (this.props.title !== prevProps.title) {
      this.setState({ title: this.props.title })
    }
  }

  sortData (unsorted) {
    let data = []
    if (this.props.sortAscending) {
      data = unsorted.sort((a, b) => a.id - b.id)
    } else {
      data = unsorted.sort((a, b) => b.id - a.id)
    }
    return data
  }

  unixTimeToString (d) {
    const m = moment(d.id)
    return m.calendar()
  }

  render () {
    let { data, title } = this.state

    const columns = [
      {
        Header: 'Time',
        id: 'id',
        accessor: this.unixTimeToString,
        maxWidth: 180
      }
    ]

    if (this.props.showSite) {
      columns.push({
        Header: 'Site',
        id: 'domain',
        accessor: d => d.domain,
        Cell: row => (row.value
          ? <div key={row.value}>
            <Link href={'#/sites/' + row.value}>
              {row.value}
            </Link>
          </div> : null),
        width: 200
      })
    }

    columns.push({
      Header: 'Page',
      id: 'title',
      accessor: d => d,
      Cell: row => (row.value.url
        ? (<div key={row.value.title}>
          <Link href={row.value.url} target='_blank'>
            <TruncateText>
              {row.value.title}&nbsp;
              <FontAwesomeIcon icon='external-link-alt' size='xs' />
            </TruncateText>
          </Link>
        </div>)
        : (<div key={row.value.title}>
          <TruncateText>{row.value.title}</TruncateText>
        </div>)
      )
    })

    if (this.props.showInference) {
      columns.push({
        Header: 'Inference',
        id: 'infer',
        accessor: d => d.inference,
        Cell: row => (row.value
          ? <div key={row.value}>
            <Link href={'#/interests/' + row.value}>
              {row.value}
            </Link>
          </div> : null
        ),
        width: 300
      })
    }

    const pageSize = Math.min(10, Math.max(data.length, 3))

    return (
      <ReactTable
        data={data}
        columns={[
          {
            Header: title,
            columns: columns
          }
        ]}
        showPageSizeOptions={false}
        pageSize={pageSize}
        noDataText={this.props.noDataText}
        className='-striped -highlight'
      />
    )
  }
}
