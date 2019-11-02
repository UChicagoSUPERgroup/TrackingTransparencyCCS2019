import React from 'react'

import View from '@instructure/ui-layout/lib/components/View'

const TTPanel2 = (props) => (
  <View
    {...props}
    as='div'
    margin={props.margin || 'none'}
    padding={props.padding || 'medium'}
    textAlign={props.textAlign || 'start'}
    background='inverse'
    borderWidth='large'
    shadow='resting'
  >
    {props.children}
  </View>
)

export default TTPanel2
