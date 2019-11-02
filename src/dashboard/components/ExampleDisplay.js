// This code is not currently in use; if at a later time we want to change the example button/popover cluster on the homepage to a carousel, then we will need this.

import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import View from '@instructure/ui-layout/lib/components/View'
import Button from '@instructure/ui-buttons/lib/components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class ExampleDisplay extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      slideNum: 0
    }
  }

  componentDidUpdate () {

  }

  const handleExampleDisplay = (slideNum) => {
    var example = 0
    var exampleText, buttonText = ""
    var icon = null

    switch (example) {
      case 0:
        icon = <FontAwesomeIcon icon='user' size='2x' />
        exampleText = "Your interests are used to tailor your web experience."
        buttonText = "See example"
        break
      case 1:
        icon = <FontAwesomeIcon icon='paw' size='2x' />
        exampleText = "You see an ad about dog clothes because you previously visited a blog about traveling with dogs. A third-party tracker on that blog guessed that you have an interest in dogs."
        buttonText = "See another example"
        break
      case 2:
        icon = <FontAwesomeIcon icon='search' size='2x' />
        exampleText = "You want to know more about apples, the fruit, so you search for \"apple\". However, because you often search for technical topics, you see results for Apple, the company."
        buttonText = "See another example"

        break
      case 3:
        icon = <FontAwesomeIcon icon='question' size='2x' />
        exampleText = "You see an ad for a horror movie, even though you don't like horror movies. However, you recently searched for sweaters and an advertiser decided that sweater fans should see this ad."
        buttonText = "return"
        break
    }
    return (
      // <div>
      //   {icon}
      //   <p>{exampleText}</p>
      //   <Button size="small" >{buttonText}</Button>
      // </div>
      <View
        as="div"
        display="inline-block"
        margin="large"
        textAlign="center"
        borderRadius="medium"
        maxWidth="200px"
        shadow="resting"
      >
        <p style={{margin:"10px"}}><FontAwesomeIcon icon='paw' size='2x' /><br/>You see an ad about dog clothes because you previously visited a blog about traveling with dogs. A third-party tracker on that blog guessed that you have an interest in dogs.</p>
        <Button size="small" >{buttonText}</Button>
      </View>
    )
  }

  render () {
    return (
      handleExampleDisplay()
    )
  }
}
